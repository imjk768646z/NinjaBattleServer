const Action = {
    'TestJoin': '1000',
    'TestMove': '2000',
}

const ActionReverse = Object.fromEntries(Object.entries(Action).map(([k, v]) => [v, k]));

module.exports = { Action, ActionReverse };