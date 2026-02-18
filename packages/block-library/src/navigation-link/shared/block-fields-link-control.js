/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { useEntityBinding } from './use-entity-binding';
import { useHandleLinkChange } from './use-handle-link-change';
import { useLinkPreview } from './use-link-preview';
import { getSuggestionsQuery } from '../link-ui';
import { unlock } from '../../lock-unlock';

const { LinkPicker } = unlock( blockEditorPrivateApis );

/**
 * Custom Link field component for navigation blocks that properly handles bindings.
 *
 * This component is designed to work with the Block Fields system while maintaining
 * the full functionality of navigation link blocks, including:
 * - Entity bindings (syncing with pages, posts, categories, etc.)
 * - The `id`, `kind`, and `type` attributes
 * - Link preview with badges showing binding status
 *
 * @param {Object}   props          - Component props
 * @param {Object}   props.data     - Block attributes
 * @param {Function} props.onChange - Callback to update block attributes
 * @param {Object}   props.config   - Configuration object with clientId
 */
export function NavigationLinkFieldControl( { data, onChange, config } ) {
	const clientId = config?.clientId;

	// Get entity binding information
	const { hasUrlBinding, isBoundEntityAvailable, entityRecord } =
		useEntityBinding( {
			clientId,
			attributes: data,
		} );

	// Get the link change handler with built-in binding management
	const handleLinkChange = useHandleLinkChange( {
		clientId,
		attributes: data,
		setAttributes: onChange,
	} );

	// Get link title from entity record
	const linkTitle =
		entityRecord?.title?.rendered ||
		entityRecord?.title ||
		entityRecord?.name;

	// Compute preview data for the LinkPicker
	const preview = useLinkPreview( {
		url: data.url,
		title: linkTitle,
		image: null, // Image fetching handled separately if needed
		type: data.type,
		entityStatus: entityRecord?.status,
		hasBinding: hasUrlBinding,
		isEntityAvailable: isBoundEntityAvailable,
	} );

	// Build suggestions query based on current link type
	const suggestionsQuery = useMemo(
		() => getSuggestionsQuery( data.type, data.kind ),
		[ data.type, data.kind ]
	);

	return (
		<LinkPicker
			preview={ preview }
			onSelect={ handleLinkChange }
			suggestionsQuery={ suggestionsQuery }
			label={ __( 'Link' ) }
		/>
	);
}
