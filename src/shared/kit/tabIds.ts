/** Id of a tab button in a `Tabs` group. */
export const tabId = (base: string, value: string): string => `${base}-tab-${value}`;

/** Id of the panel a tab controls — put it on the `role="tabpanel"` element. */
export const tabPanelId = (base: string, value: string): string => `${base}-panel-${value}`;
