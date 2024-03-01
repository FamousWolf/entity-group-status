import { css, html, LitElement } from 'lit';
import * as chrono from 'chrono-node';
import styles from './card.styles';
import { EntityGroupStatusEntity } from "./entity";

export class EntityGroupStatus extends LitElement {
    static styles = styles;

    _hass;
    _entityAction = false;

    /**
     * Get properties
     *
     * @return {Object}
     */
    static get properties() {
        return {
            _mainIcon: { type: String, state: true },
            _mainTitle: { type: String, state: true },
            _mainState: { type: String, state: true },
            _scores: { type: Array, state: true },
            _entities: { type: Object, state: true },
            _maximumScore: { type: String, state: true },
            _mainIconScoreColor: { type: Boolean, state: true },
            _actions: { type: Object, state: true },
            _dateFormat: { type: Object, state: true }
        }
    }

    /**
     * Set configuration
     *
     * @param {Object} config
     */
    setConfig(config) {
        if (!config.scores) {
            throw new Error('No scores are configured');
        }

        this._mainIcon = config.icon ?? null;
        this._mainIconScoreColor = config.iconScoreColor ?? false;
        this._mainTitle = config.title ?? null;
        this._actions = config.actions ?? null;
        this._dateFormat = config.dateFormat ?? {};
        this._initializeScores(config.scores);
        this._initializeEntities(config.entities ?? {});
    }

    /**
     * Set hass
     *
     * @param {Object} hass
     */
    set hass(hass) {
        this._hass = hass;
        this._processEntityStates();
    }

    /**
     * Render
     *
     * @return {Object}
     */
    render() {
        let cardClasses = [];
        if (this._actions) {
            cardClasses.push('hasActions');
        }
        return html`
            <ha-card @click="${this._cardClick}" class="${cardClasses.join(' ')}">
                <div class="card-content">
                    ${this._renderMainIcon()}
                    ${this._renderMainTitle()}
                    ${this._renderMainState()}
                    ${this._renderEntities()}
                </div>
            </ha-card>
        `;
    }

    /**
     * Render main icon
     *
     * @return {Object}
     * @private
     */
    _renderMainIcon() {
        if (!this._mainIcon) {
            return html``;
        }

        let color = 'inherit';
        if (
            this._mainIconScoreColor
            && this._maximumScore
            && this._scores[this._maximumScore]
        ) {
            color = this._scores[this._maximumScore].color ?? color;
        }

        return html`
            <div class="main-icon" style="--icon-color: ${color}">
                <div class="shape">
                    <ha-icon icon="${this._mainIcon}"></ha-icon>
                </div>
            </div>
        `;
    }

    /**
     * Render main title
     *
     * @return {Object}
     * @private
     */
    _renderMainTitle() {
        if (!this._mainTitle) {
            return html``;
        }

        return html`
            <div class="main-title">
                ${this._mainTitle ?? ''}
            </div>
        `;
    }

    /**
     * Render main state
     *
     * @return {Object}
     * @private
     */
    _renderMainState() {
        if (!this._mainState) {
            return html``;
        }

        return html`
            <div class="main-state">
                ${this._mainState ?? ''}
            </div>
        `;
    }

    /**
     * Render entities
     *
     * @return {Object}
     * @private
     */
    _renderEntities() {
        if (!this._entities) {
            return html``;
        }

        return html`
            <div class="entities">
                ${Object.entries(this._entities).map(([entityId, entity]) => this._renderEntity(entity))}
            </div>
        `;
    }

    /**
     * Render entity
     *
     * @param {Object} entity
     * @return {Object}
     * @private
     */
    _renderEntity(entity) {
        const score = entity.score ?? '';
        let hide = false;
        if (this._scores[score] && this._scores[score].hideEntity) {
            hide = true;
        }
        const title = entity.title ?? '';
        const icon = entity.icon ?? 'mdi:alpha-x';
        let state = entity.state ?? 'Unknown';
        if (entity.configuration.stateConvert === 'date' && state !== 'Unknown') {
            state = state.toLocaleDateString(
                this._dateFormat.locale ?? navigator.language ?? 'en-US',
                this._dateFormat.options ?? {}
            );
        }
        const unit = entity.unit ?? '';
        let color = 'inherit';
        if (score && this._scores[score]) {
            color = this._scores[score].color ?? color;
        }
        let actions = null;
        if (entity.configuration.actions) {
            actions = structuredClone(entity.configuration.actions);
            actions.entity = actions.entity ?? entity.entity;
        }

        return html`
            <entity-group-status-entity icon="${icon}" title="${title}" state="${state}" unit="${unit}" color="${color}" ?hide="${hide}" .actions="${actions}"></entity-group-status-entity>
        `;

    }

    /**
     * Initialize scores
     *
     * @param {Object} scoresConfiguration
     * @private
     */
    _initializeScores(scoresConfiguration) {
        let scores = {};

        Object.entries(scoresConfiguration).forEach(([scoreKey, scoreConfiguration]) => {
            // Sanitize and check score key
            scoreKey = this._sanitizeKey(scoreConfiguration.score ?? scoreKey, true);
            if (!scoreKey) {
                throw new Error('Invalid score configuration: missing or invalid score key');
            }

            //
            if (scoreKey in scores) {
                throw new Error('Invalid score configuration: duplicate score key "' + scoreKey + '"');
            }

            scores[scoreKey] = {
                color: scoreConfiguration.color ?? 'inherit',
                text: scoreConfiguration.text ?? '',
                hideEntity: scoreConfiguration.hideEntity ?? false,
            };
        });

        this._scores = scores;
    }

    /**
     * Initialize entities
     *
     * @param {array} entitiesConfiguration
     * @private
     */
    _initializeEntities(entitiesConfiguration) {
        if (!entitiesConfiguration) {
            this._entities = {};
            return;
        }

        if (!this._entities) {
            this._entities = {};
        }

        let entities = {};

        if (!Array.isArray(entitiesConfiguration)) {
            throw new Error('Invalid entities configuration: entities must be an array');
        }

        entitiesConfiguration.forEach(entityConfiguration => {
            if (!entityConfiguration.entity) {
                throw new Error('Invalid entities configuration: missing entity identifier');
            }

            const entityId = entityConfiguration.entity;
            entities[entityId] = {
                entity: entityId,
                title: entityConfiguration.title ?? '',
                icon: entityConfiguration.icon ?? '',
                score: this._entities[entityId] ? this._entities[entityId].score : null,
                state: this._entities[entityId] ? this._entities[entityId].state : null,
                unit: this._entities[entityId] ? this._entities[entityId].unit : null,
                configuration: entityConfiguration
            };
        });

        this._entities = entities;
    }

    /**
     * Process entity states
     *
     * @private
     */
    _processEntityStates() {
        if (!this._entities) {
            return;
        }

        let entityStateChanged = false;
        let maximumScore = 0;
        Object.entries(this._entities).forEach(([entityId, entity]) => {
            const entityStateObject = this._getEntityState(entityId);
            let entityState = entityStateObject ? entityStateObject.state ?? false : false;
            const entityUnit = entityStateObject ? entityStateObject.attributes.unit_of_measurement ?? '' : '';
            let entityScoreKey = '';
            if (entityState !== false) {
                if (entity.configuration.states) {
                    if (!Array.isArray(entity.configuration.states)) {
                        throw new Error('Invalid entities configuration: states must be an array or not set');
                    }

                    if (entity.configuration.stateConvert === 'date') {
                        entityState = chrono.parseDate(entityState);
                    }
                    for (let stateConfigurationKey in entity.configuration.states) {
                        const stateConfiguration = entity.configuration.states[stateConfigurationKey];

                        const stateScoreKey = this._sanitizeKey(stateConfiguration.score ?? '', true);
                        if (!stateScoreKey) {
                            throw new Error('Invalid entities configuration: missing or invalid entity score key');
                        }

                        let min = stateConfiguration.min ?? false;
                        let max = stateConfiguration.max ?? false;
                        let equals = stateConfiguration.equals ?? false;
                        if (entity.configuration.stateConvert === 'date') {
                            if (min) {
                                min = chrono.parseDate(min);
                            }
                            if (max) {
                                max = chrono.parseDate(max);
                            }
                            if (equals) {
                                equals = chrono.parseDate(equals);
                            }
                        }

                        if (
                            (
                                !min
                                || entityState >= min
                            ) && (
                                !max
                                || entityState <= max
                            ) && (
                                !equals
                                || entityState == equals
                            )
                        ) {
                            entityScoreKey = stateScoreKey;
                            break;
                        }
                    }
                }
            }

            if (entityScoreKey > maximumScore) {
                maximumScore = entityScoreKey;
            }

            if (
                entityScoreKey !== this._entities[entityId].score
                || entityState !== this._entities[entityId].state
                || entityUnit !== this._entities[entityId].unit
            ) {
                entityStateChanged = true;
            }

            this._entities[entityId].score = entityScoreKey;
            this._entities[entityId].state = entityState;
            this._entities[entityId].unit = entityUnit;
        });
        this._maximumScore = maximumScore;
        if (entityStateChanged) {
            this._entities = structuredClone(this._entities);
        }

        let mainState = '';
        if (this._maximumScore && this._scores[this._maximumScore]) {
            mainState = this._scores[this._maximumScore].text ?? mainState;
        }
        this._mainState = mainState;
    }

    /**
     * Get entity state
     *
     * @param {string} entityId
     * @return {*|boolean}
     * @private
     */
    _getEntityState(entityId) {
        if (
            !this._hass
            || !this._hass.states
            || !this._hass.states[entityId]
        ) {
            return false;
        }

        return this._hass.states[entityId];
    }

    /**
     * Handle click on card
     *
     * @private
     */
    _cardClick() {
        if (!this._actions) {
            return;
        }

        if (this._entityAction) {
            this._entityAction = false;
            return;
        }

        const event = new Event(
            'hass-action', {
                bubbles: true,
                composed: true,
            }
        );
        event.detail = {
            config: this._actions,
            action: 'tap',
        }
        this.dispatchEvent(event);
    }

    /**
     * Sanitize key
     * Make sure it's a string and remove all non-alphanumeric chars
     *
     * @param key
     * @param {boolean} numericalOnly
     * @return {string}
     * @private
     */
    _sanitizeKey(key, numericalOnly) {
        numericalOnly = numericalOnly ?? false;
        if (typeof key !== 'string') {
            try {
                key = key.toString();
            } catch {
                key = '';
            }
        }
        let regex = /\W/g;
        if (numericalOnly) {
            regex = /\D/g
        }
        return key.replace(regex, '');
    }
}
