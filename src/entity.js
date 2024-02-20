import { html, LitElement } from 'lit';
import styles from './entity.styles';

export class EntityGroupStatusEntity extends LitElement {
    static styles = styles;

    /**
     * Get properties
     *
     * @return {Object}
     */
    static get properties() {
        return {
            icon: { type: String },
            title: { type: String },
            state: { type: String },
            unit: { type: String },
            color: { type: String },
            hide: { type: Boolean },
            actions: { type: Object }
        }
    }

    /**
     * Render
     *
     * @return {Object}
     */
    render() {
        if (this.hide) {
            return html``;
        }

        let entityClasses = ['entity'];
        if (this.actions) {
            entityClasses.push('hasActions');
        }

        return html`
            <div class="${entityClasses.join(' ')}" title="${this.title}: ${this.state} ${this.unit}" style="--icon-color: ${this.color}" @click="${this._entityClick}">
                <div class="shape">
                    <ha-icon icon="${this.icon}"></ha-icon>
                </div>
            </div>
        `;
    }

    /**
     * Handle entity click
     *
     * @param {Object} e
     * @private
     */
    _entityClick(e) {
        if (!this.actions) {
            return;
        }

        const event = new Event(
            'hass-action', {
                bubbles: true,
                composed: true,
            }
        );
        event.detail = {
            config: this.actions,
            action: 'tap',
        }
        this.dispatchEvent(event);

        e.stopImmediatePropagation();
    }
}
customElements.define('entity-group-status-entity', EntityGroupStatusEntity);
