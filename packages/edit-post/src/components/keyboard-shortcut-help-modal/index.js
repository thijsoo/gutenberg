/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	useShortcut,
	store as keyboardShortcutsStore,
} from '@wordpress/keyboard-shortcuts';
import { withSelect, withDispatch, useSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { privateApis as editorPrivateApis } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { textFormattingShortcuts } from './config';
import Shortcut from './shortcut';
import DynamicShortcut from './dynamic-shortcut';
import { unlock } from '../../lock-unlock';

const { interfaceStore } = unlock( editorPrivateApis );
export const KEYBOARD_SHORTCUT_HELP_MODAL_NAME =
	'edit-post/keyboard-shortcut-help';

const ShortcutList = ( { shortcuts } ) => (
	/*
	 * Disable reason: The `list` ARIA role is redundant but
	 * Safari+VoiceOver won't announce the list otherwise.
	 */
	/* eslint-disable jsx-a11y/no-redundant-roles */
	<ul
		className="edit-post-keyboard-shortcut-help-modal__shortcut-list"
		role="list"
	>
		{ shortcuts.map( ( shortcut, index ) => (
			<li
				className="edit-post-keyboard-shortcut-help-modal__shortcut"
				key={ index }
			>
				{ typeof shortcut === 'string' ? (
					<DynamicShortcut name={ shortcut } />
				) : (
					<Shortcut { ...shortcut } />
				) }
			</li>
		) ) }
	</ul>
	/* eslint-enable jsx-a11y/no-redundant-roles */
);

const ShortcutSection = ( { title, shortcuts, className } ) => (
	<section
		className={ classnames(
			'edit-post-keyboard-shortcut-help-modal__section',
			className
		) }
	>
		{ !! title && (
			<h2 className="edit-post-keyboard-shortcut-help-modal__section-title">
				{ title }
			</h2>
		) }
		<ShortcutList shortcuts={ shortcuts } />
	</section>
);

const ShortcutCategorySection = ( {
	title,
	categoryName,
	additionalShortcuts = [],
} ) => {
	const categoryShortcuts = useSelect(
		( select ) => {
			return select( keyboardShortcutsStore ).getCategoryShortcuts(
				categoryName
			);
		},
		[ categoryName ]
	);

	return (
		<ShortcutSection
			title={ title }
			shortcuts={ categoryShortcuts.concat( additionalShortcuts ) }
		/>
	);
};

export function KeyboardShortcutHelpModal( { isModalActive, toggleModal } ) {
	useShortcut( 'core/edit-post/keyboard-shortcuts', toggleModal );

	if ( ! isModalActive ) {
		return null;
	}

	return (
		<Modal
			className="edit-post-keyboard-shortcut-help-modal"
			title={ __( 'Keyboard shortcuts' ) }
			closeButtonLabel={ __( 'Close' ) }
			onRequestClose={ toggleModal }
		>
			<ShortcutSection
				className="edit-post-keyboard-shortcut-help-modal__main-shortcuts"
				shortcuts={ [ 'core/edit-post/keyboard-shortcuts' ] }
			/>
			<ShortcutCategorySection
				title={ __( 'Global shortcuts' ) }
				categoryName="global"
			/>

			<ShortcutCategorySection
				title={ __( 'Selection shortcuts' ) }
				categoryName="selection"
			/>

			<ShortcutCategorySection
				title={ __( 'Block shortcuts' ) }
				categoryName="block"
				additionalShortcuts={ [
					{
						keyCombination: { character: '/' },
						description: __(
							'Change the block type after adding a new paragraph.'
						),
						/* translators: The forward-slash character. e.g. '/'. */
						ariaLabel: __( 'Forward-slash' ),
					},
				] }
			/>
			<ShortcutSection
				title={ __( 'Text formatting' ) }
				shortcuts={ textFormattingShortcuts }
			/>
			<ShortcutCategorySection
				title={ __( 'List View shortcuts' ) }
				categoryName="list-view"
			/>
		</Modal>
	);
}

export default compose( [
	withSelect( ( select ) => ( {
		isModalActive: select( interfaceStore ).isModalActive(
			KEYBOARD_SHORTCUT_HELP_MODAL_NAME
		),
	} ) ),
	withDispatch( ( dispatch, { isModalActive } ) => {
		const { openModal, closeModal } = dispatch( interfaceStore );

		return {
			toggleModal: () =>
				isModalActive
					? closeModal()
					: openModal( KEYBOARD_SHORTCUT_HELP_MODAL_NAME ),
		};
	} ),
] )( KeyboardShortcutHelpModal );
