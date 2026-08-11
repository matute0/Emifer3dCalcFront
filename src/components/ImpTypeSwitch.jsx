import { useCalculatorStore } from "../store/CalculatorStore"

export default function ImpTypeSwitch(){

    const impType = useCalculatorStore((state) => state.impType);
    const setImpType = useCalculatorStore((state) => state.setImpType);

    return(
        <>
        <div className="grid grid-cols-2 gap-2 bg-gray-900 p-1.5 rounded-lg mb-6 border border-gray-700">
        <button
          type="button"
          onClick={() => setImpType('simple')}
          className={`py-2 px-4 text-sm font-medium rounded-md transition-all ${
            impType === 'simple'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Simple
        </button>

        <button
          type="button"
          onClick={() => setImpType('multicolor')}
          className={`py-2 px-4 text-sm font-medium rounded-md transition-all ${
            impType === 'multicolor'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Multicolor
        </button>
      </div>
        </>
    )
}