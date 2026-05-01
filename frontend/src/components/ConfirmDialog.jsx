// Boîte de confirmation personnalisée
const ConfirmDialog = ({ message, onConfirmer, onAnnuler }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        Confirmation
      </h3>
      <p className="text-gray-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onAnnuler}
          className="flex-1 py-2 border border-gray-300 rounded-lg
            text-sm text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirmer}
          className="flex-1 py-2 bg-red-600 text-white rounded-lg
            text-sm font-medium hover:bg-red-700"
        >
          Confirmer
        </button>
      </div>
    </div>
  </div>
)

export default ConfirmDialog