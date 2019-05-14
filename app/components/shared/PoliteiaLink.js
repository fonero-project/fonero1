import ExternalLink from "./ExternalLink";

export default ({ children, path }) => (
  <ExternalLink
    href={"https://proposals.fonero.org" + (path||"")}
    hrefTestNet={"https://test-proposals.fonero.org" + (path||"")}
  >
    {children}
  </ExternalLink>
);
