export const formatStatus = (status = '') => String(status ?? '')
  .replace(/_/g, ' ')
  .toLowerCase()
  .replace(/\b\w/g, character => character.toUpperCase());

export const formatOrganizationName = (name = '') => String(name ?? '')
  .toLowerCase()
  .replace(/\b\w/g, character => character.toUpperCase());
