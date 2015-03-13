var inventory = {
  'tablet': false,
  'food': false,
  'coat': false,
  'keys': false
};

function has(item) {
  return inventory[item] == true;
}

function take(item) {
  inventory[item] = true;
}