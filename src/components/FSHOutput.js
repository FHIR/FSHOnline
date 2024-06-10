import React, { useState } from 'react';
import FileSaver from 'file-saver';
import CodeMirrorComponent from './CodeMirrorComponent';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function FSHOutput(props) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleOpenDeleteModal = () => {
    setOpenDeleteModal(!openDeleteModal);
  };

  const handleCloseAndDelete = () => {
    setOpenDeleteModal(false);
    props.setInitialText('');
  };

  const handleSave = () => {
    FileSaver.saveAs(new Blob([props.text]), 'FSH.fsh');
  };

  return (
    <>
      <CodeMirrorComponent
        name={'FSH'}
        isExamples={false}
        value={props.text}
        initialText={props.initialText}
        updateTextValue={props.updateTextValue}
        mode={'fsh'}
        placeholder={props.isWaiting ? 'Loading...' : 'Paste or edit FSH here...'}
        delete={handleOpenDeleteModal}
        save={handleSave}
        config={props.config}
        textWrapped={props.textWrapped}
      />
      {openDeleteModal && (
        <DeleteConfirmationModal
          title={'FHIR Shorthand'}
          item={'all FSH'}
          isOpen={openDeleteModal}
          handleCloseModal={handleOpenDeleteModal}
          handleDelete={handleCloseAndDelete}
        />
      )}
    </>
  );
}
