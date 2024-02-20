import { css } from 'lit';

export default css`
    :host {
        --spacing: 3px;
        --icon-size: 24px;
        --icon-color: var(--primary-text-color);
        --icon-shape-spacing: 16px;
    }
    .entity {
        --icon-primary-color: var(--icon-color, inherit);
        --mdc-icon-size: var(--icon-size);
        position: relative;
        padding-right: var(--spacing);
        padding-bottom: var(--spacing);
    }
    .entity.hasActions {
        cursor: pointer;
    }
    .entity .shape {
        position: relative;
        width: calc(var(--icon-size) + var(--icon-shape-spacing));
        height: calc(var(--icon-size) + var(--icon-shape-spacing));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    .entity .shape::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-color: var(--icon-color);
        opacity: .2;
    }
`;
