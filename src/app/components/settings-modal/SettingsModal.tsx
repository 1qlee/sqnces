import ColorModeToggle from "../toggles/ColorModeToggle";
import * as Dialog from "@radix-ui/react-dialog";
import modalStyles from "../info-modal/InfoModal.module.css";
import marginStyles from "../styles/Margin.module.css";
import type { Dispatch, SetStateAction } from "react";
import flexStyles from "../styles/Flex.module.css";
import HardModeToggle from "../toggles/HardModeToggle";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { XCircle } from "@phosphor-icons/react";
import type { Game } from "../game/Game.types";

type SettingsModalProps = {
  currentGame: Game;
  showSettingsModal: boolean;
  setShowSettingsModal: Dispatch<SetStateAction<boolean>>;
}

export default function SettingsModal({
  currentGame,
  showSettingsModal,
  setShowSettingsModal,
}: SettingsModalProps) {
  return (
    <Dialog.Root
      defaultOpen={false}
      open={showSettingsModal}
      onOpenChange={(open) => setShowSettingsModal(open)}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={modalStyles.modalOverlay} />
        <Dialog.Content
          className={modalStyles.modalContent}
          aria-describedby={undefined}
        >
          <div className={modalStyles.modalInner}>
            <h2 className={modalStyles.heading}>Settings</h2>
            <div className={[
              flexStyles.flexList,
              marginStyles.mb4,
            ].join(" ")}>
              <p>Theme</p>
              <ColorModeToggle />
            </div>
            <div className={[
              flexStyles.flexList,
              flexStyles.alignStart,
            ].join(" ")}>
              <div>
                <p>Hard mode</p>
                <small className={modalStyles.subtext}>If ON, out of bounds letters won't show additional clues like misplaced and incorrect letters.</small>
              </div>
              <HardModeToggle 
                game={currentGame}
              />
            </div>
          </div>
          <VisuallyHidden.Root asChild>
            <Dialog.Title>
              Settings dialog
            </Dialog.Title>
          </VisuallyHidden.Root>
          <Dialog.Close asChild>
            <button
              className={modalStyles.button}
              aria-label="Close"
            >
              <XCircle
                className={modalStyles.icon}
                size={32}
              />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}