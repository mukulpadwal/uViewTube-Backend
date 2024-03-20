function validateEmail(email) {
  const pattern =
    "/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/";
  if (pattern.test(email)) {
    return true;
  }

  return "Please enter a valid email address...";
}

export default validateEmail;
