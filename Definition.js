const Action = {
    'Join': '1000',
    'Move': '2000',
    'Stop': '3000',
    'Jump': '4000',
    'PositionInfo': '5000',
    'Attack': '6000',
    'Die': '7000',
}

const ActionReverse = Object.fromEntries(Object.entries(Action).map(([k, v]) => [v, k]));

module.exports = { Action, ActionReverse };