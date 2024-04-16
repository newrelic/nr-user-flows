import { NerdGraphQuery } from 'nr1';

export const generateTopInteractionsQuery = (timeRangeClause, limit) =>
  `FROM BrowserInteraction SELECT uniqueCount(session), average(duration) FACET browserInteractionName, domain, category, trigger, actionText where category = 'Initial page load' AND previousUrl = targetUrl ${timeRangeClause} LIMIT ${limit}`;

export const generateEntityData = (entityGuid, timeRangeClause) => {
  return new Promise(resolve => {
    const topQuery = generateTopInteractionsQuery(timeRangeClause, 5);

    NerdGraphQuery.query({
      query: `{
        actor {
          entity(guid: "${entityGuid}") {
            ... on Entity {
                topQuery: nrdbQuery(nrql: "${topQuery}", timeout: 120) {
                    rawResponse
                  }
              guid
              name
              type
              account {
                id
                name
              }
              entityType
              domain
              alertSeverity
              indexedAt
              reporting
              accountId
            }
          }
        }
      }`
    }).then(data => {
      const entity = data?.data?.actor?.entity;
      entity.timeRangeClause = timeRangeClause;

      resolve(entity);
    });
  });
};
