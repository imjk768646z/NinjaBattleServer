const Action = {
    'Join': '1001',
    'Move': '1002',
    'Stop': '1003',
    'Jump': '1004',
    'PositionInfo': '1005',
    'Attack': '1006',
    'Die': '1007',
    'Damage': '1008',
    'HealthBuff': '1009',
}

const ActionReverse = Object.fromEntries(Object.entries(Action).map(([k, v]) => [v, k]));

module.exports = { Action, ActionReverse };