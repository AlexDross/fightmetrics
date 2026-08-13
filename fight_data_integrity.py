"""Pure integrity gates for the Greco/UFCStats aggregate inputs.

The scheduled updater is intentionally an executable script, so importing it
runs the whole rebuild.  These transformations live here so duplicate-event
handling can be exercised against committed fixtures without touching any
generated artifact.
"""

from pathlib import Path

import pandas as pd


REQUIRED_AGGREGATE_CSVS = (
    'ufc_fight_results.csv',
    'ufc_event_details.csv',
    'ufc_fight_details.csv',
    'ufc_fight_stats.csv',
)


class AggregateConflictError(RuntimeError):
    """An alias and canonical event disagree for the same aggregate row."""


def load_required_csv(path, *, dtype=str):
    """Read a required updater input and fail with a useful path-specific error."""
    csv_path = Path(path)
    if not csv_path.is_file():
        raise FileNotFoundError(
            f"Required aggregate input is missing: {csv_path}. "
            "The updater cannot safely substitute partial fighter data."
        )
    try:
        return pd.read_csv(csv_path, dtype=dtype)
    except Exception as exc:
        raise RuntimeError(f"Could not read required aggregate input {csv_path}: {exc}") from exc


def _comparison_value(value):
    if pd.isna(value):
        return None
    if isinstance(value, str):
        return value.strip()
    return value


def canonicalize_alias_rows(df, alias_map, *, identity_columns, source_name):
    """Canonicalize event aliases and collapse only cross-event duplicates.

    A repeated identity inside the *same* source event is left alone.  UFCStats
    has historical examples where the same bout label was used twice on one
    card; treating every repeated label as an alias duplicate would erase a
    real fight.  Rows are candidates for collapse only when at least two
    distinct source event names map onto the same canonical identity.

    Cross-event rows must be payload-identical after whitespace/NaN
    normalization.  Any disagreement is a hard failure instead of a guess.
    """
    required = {'EVENT', *identity_columns}
    missing = sorted(required - set(df.columns))
    if missing:
        raise KeyError(f"{source_name} is missing required columns: {', '.join(missing)}")

    if not alias_map:
        return df.copy(), {'canonicalizedRows': 0, 'collapsedRows': 0}

    out = df.copy()
    out['EVENT'] = out['EVENT'].fillna('').astype(str).str.strip()
    out['__source_event'] = out['EVENT']
    out['EVENT'] = out['EVENT'].replace(alias_map)
    keys = list(identity_columns)
    if 'EVENT' not in keys:
        keys.insert(0, 'EVENT')
    payload_columns = [
        col for col in out.columns
        if col not in keys and col != '__source_event'
    ]

    drop_indexes = []
    canonicalized_rows = int(out['__source_event'].isin(alias_map).sum())
    grouped = out.groupby(keys, dropna=False, sort=False)
    for identity, group in grouped:
        source_events = set(group['__source_event'])
        if len(source_events) < 2:
            continue

        payloads = {
            tuple(_comparison_value(row[col]) for col in payload_columns)
            for _, row in group.iterrows()
        }
        if len(payloads) != 1:
            differing = {
                col: sorted(
                    {repr(_comparison_value(value)) for value in group[col]},
                )
                for col in payload_columns
                if len({_comparison_value(value) for value in group[col]}) > 1
            }
            raise AggregateConflictError(
                f"{source_name} conflict after event canonicalization at "
                f"{identity!r}; source events={sorted(source_events)!r}; "
                f"differing payload={differing!r}"
            )

        canonical_event = group.iloc[0]['EVENT']
        preferred = group[group['__source_event'] == canonical_event]
        keep_index = preferred.index[0] if not preferred.empty else group.index[0]
        drop_indexes.extend(index for index in group.index if index != keep_index)

    out = out.drop(index=drop_indexes).drop(columns='__source_event').reset_index(drop=True)
    return out, {
        'canonicalizedRows': canonicalized_rows,
        'collapsedRows': len(drop_indexes),
    }


def canonicalize_aggregate_inputs(results_df, details_df, stats_df, alias_map):
    """Apply one event identity policy to all updater aggregate inputs."""
    results, result_summary = canonicalize_alias_rows(
        results_df,
        alias_map,
        identity_columns=('EVENT', 'BOUT'),
        source_name='ufc_fight_results.csv',
    )
    details, detail_summary = canonicalize_alias_rows(
        details_df,
        alias_map,
        identity_columns=('EVENT', 'BOUT'),
        source_name='ufc_fight_details.csv',
    )
    stats, stats_summary = canonicalize_alias_rows(
        stats_df,
        alias_map,
        identity_columns=('EVENT', 'BOUT', 'ROUND', 'FIGHTER'),
        source_name='ufc_fight_stats.csv',
    )
    return results, details, stats, {
        'results': result_summary,
        'details': detail_summary,
        'stats': stats_summary,
    }
