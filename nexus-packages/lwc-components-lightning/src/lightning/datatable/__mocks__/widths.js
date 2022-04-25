export const tableScrollWidth = 2000;

export const dataCellWidths = [1000, 50, 300, 100, 50, 500];

export const headerCellWidths = [1000, 50, 200, 200, 50, 250, 250];

export const dataCellWidthsRandom = [324, 520, 34, 234, 767, 122];

export const definedWidths = [50, 32, 100, 200, 300, 400, 500];

export const columnDefsWithWidths = [
    { label: 'a', fixedWidth: definedWidths[0] },
    { label: 'b', columnWidth: definedWidths[1], isResized: true },
    { label: 'c', fixedWidth: definedWidths[2] },
    { label: 'd', initialWidth: definedWidths[3] },
    { label: 'e', initialWidth: definedWidths[4] },
    { label: 'f', initialWidth: definedWidths[5] },
    { label: 'g', initialWidth: definedWidths[6] },
];
export const columnDefsFlexibleWidths = [
    { label: 'a', fixedWidth: definedWidths[0] },
    { label: 'b', columnWidth: definedWidths[1], isResized: true },
    { label: 'c', initialWidth: definedWidths[2] },
    { label: 'd' },
    { label: 'e' },
    { label: 'f' },
];
export const columnDefsFlexibleWidthsMore = [
    { label: 'a', fixedWidth: definedWidths[0] },
    { label: 'b', columnWidth: definedWidths[1], isResized: true },
    { label: 'c', initialWidth: definedWidths[2] },
    { label: 'd' },
    { label: 'e' },
    { label: 'f' },
    { label: 'g' },
    { label: 'h' },
];

export const widthsMetaFixed = {
    totalFixedWidth: 50,
    totalResizedWidth: 132,
    minColumnWidth: 50,
    maxColumnWidth: 400,
};
