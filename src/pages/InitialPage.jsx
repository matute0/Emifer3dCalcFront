import ImpTypeSwitch from "../components/ImpTypeSwitch"
import LoginButton from "../components/LoginButton"
export default function InitialPage(){
    return(
        <>
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center text-center p-4">
  <div className="w-full flex justify-end p-2">
    <LoginButton />
  </div>

  <h1 className="p-10 text-4xl font-bold">Calculadora Emifer 3D</h1>
  <ImpTypeSwitch />
  <input placeholder="Gramos de filamento" />
  <input placeholder="Gramos de filamento" />
</div>
            
        </>
    )
}