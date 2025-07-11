import React, { useState } from 'react';
import ModalConFormularios from '../components/ModalConFormularios';

function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-4">
      <button
        onClick={() => setModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Abrir Modal
      </button>

      <ModalConFormularios isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default App;
