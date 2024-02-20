import { EntityGroupStatus } from './card';

customElements.define(
    'entity-group-status',
    EntityGroupStatus
);

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'entity-group-status',
    name: 'Entity group status',
    description: 'Card to group multiple entities showing a single status'
});
