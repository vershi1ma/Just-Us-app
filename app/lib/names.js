const names = {
  'vershimatarza@gmail.com': 'Vershima',
  'oyinkansola652@gmail.com': 'Oyin',
}

export function displayName(email) {
  return names[email] || email
}
