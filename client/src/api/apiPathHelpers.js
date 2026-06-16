// client/src/api/apiPathHelpers.js

const API_QUERY_VALUE = Object.freeze({
  TRUE: "1",
});

export function createQueryString(queryParams) {
  const searchParams = new URLSearchParams(queryParams);

  return `?${searchParams.toString()}`;
}

export function createBooleanQueryString(paramName, enabled) {
  if (!enabled) {
    return "";
  }

  return createQueryString({
    [paramName]: API_QUERY_VALUE.TRUE,
  });
}

export function createPathWithId(basePath, id) {
  return `${basePath}/${id}`;
}

export function createPathWithSegments(basePath, ...segments) {
  return [basePath, ...segments].join("/");
}
