const Action = {
    'Join': '1000',
    'Move': '2000',
    'Stop': '3000',
    'Jump': '4000',
    'PositionInfo': '5000',
}

const ActionReverse = Object.fromEntries(Object.entries(Action).map(([k, v]) => [v, k]));

module.exports = { Action, ActionReverse };