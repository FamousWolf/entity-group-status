import { css } from 'lit';

export default css`
    :host {
        --spacing: 16px;
        --icon-size: 24px;
        --icon-color: var(--primary-text-color);
        --icon-shape-spacing: var(--spacing);
        --title-font-weight: bold;
        --title-font-size: 12px;
        --title-line-height: 15px;
        --title-color: var(--primary-text-color);
        --state-font-weight: normal;
        --state-font-size: 24px;
        --state-line-height: 29px;
        --state-color: var(--primary-text-color);
        --entity-spacing: 8px;
    }
    ha-card {
        padding: var(--spacing, 16px);
        height: 100%;
        overflow: hidden;
    }
    ha-card.hasActions {
        cursor: pointer;
    }
    .card-content {
        display: grid;
        grid-template-columns: [column1] calc(var(--icon-size) + var(--icon-shape-spacing) + var(--spacing)) [column2] auto [columnend];
        grid-template-rows: [row1] var(--title-line-height) [row2] max(var(--state-line-height), var(--icon-size) + var(--icon-shape-spacing) - var(--title-line-height)) [row3] auto [rowend];
        padding: 0;
    }
    .main-icon {
        --icon-primary-color: var(--icon-color, inherit);
        --mdc-icon-size: var(--icon-size);
        grid-column-start: column1;
        grid-column-end: column2;
        grid-row-start: row1;
        grid-row-end: row3;
        position: relative;
        padding-right: var(--spacing);
    }
    .main-icon .shape {
        position: relative;
        width: calc(var(--icon-size) + var(--icon-shape-spacing));
        height: calc(var(--icon-size) + var(--icon-shape-spacing));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    .main-icon .shape::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-color: var(--icon-color);
        opacity: .2;
    }
    .main-title {
        grid-column-start: column1;
        grid-column-end: columnend;
        grid-row-start: row1;
        grid-row-end: row2;
        font-weight: var(--title-font-weight);
        font-size: var(--title-font-size);
        color: var(--title-color);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: var(--title-line-height);
    }
    .main-state {
        grid-column-start: column1;
        grid-column-end: columnend;
        grid-row-start: row1;
        grid-row-end: row3;
        font-weight: var(--state-font-weight);
        font-size: var(--state-font-size);
        color: var(--state-color);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: var(--state-line-height);
    }
    .card-content:has(.main-icon) .main-title,
    .card-content:has(.main-icon) .main-state {
        grid-column-start: column2;
    }
    .card-content:has(.main-title) .main-state {
        grid-row-start: row2;
    }
    .entities {
        grid-column-start: column1;
        grid-column-end: columnend;
        grid-row-start: row3;
        grid-row-end: rowend;
        display: flex;
        flex-direction: row;
        justify-content: right;
        flex-wrap: wrap;
        margin-top: var(--entity-spacing);
    }
`;