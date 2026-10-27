import Button1 from "./Button.jsx";
import Image from "next/image";

export default function Menu({ openMenu, setOpenMenu }) {
  if (!openMenu) return null;

  return (
    <div
      className="bg-red-800 top-0 text-white fixed absolute overflow-hidden p-2 z-50 h-screen right-1 w-70 md:w-100"
      style={{ backgroundImage: "url('/IMG_2268.PNG')" }}
    >
      <div className="absolute inset-0 pointer-events-none bg-red-800/60" />

      <div className="w-full p-4 flex flex-col space-y-3 items-center">
        <div className="flex w-full justify-between z-2 items-center">
          <Image
            src="/pokeball-pokemon-svgrepo-com.svg"
            className=""
            alt="Pokeball"
            width={30}
            height={30}
          />

          <p className="font-semibold text-lg text-white">
            POKE MENU
          </p>

          <button
            className="text-white hover:bg-black/30 flex justify-center items-center rounded-full active:scale-110 active:bg-black/60 w-10 h-10 font-black text-3xl"
            onClick={() => setOpenMenu(false)}
          >
            x
          </button>
        </div>

        <div className="w-[90%] bg-white h-[2px]" />
      </div>

      <div className="space-y-12 h-full">
        <div className="w-full space-y-4 p-3">
          <Button1
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            text="Home"
          />

          <Button1
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            text="Poketeam"
          />

          <Button1
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            text="Pokeinfo"
          />
        </div>

        <div className="w-[95%] h-fit h-64 z-11 relative overflow-y-hidden bg-red-700 p-2 flex flex-col items-center space-y-3 border-3 border-white rounded-md">
          <h1 className="font-black">
            Thank you for using our app!
          </h1>

          <p className="text-center">
            Enjoying the app? You can support the project
            <br />
            by making a donation.
          </p>

          <div className="flex flex-col gap-4 w-40 items-center md:flex-row md:justify-between md:w-80">
            <button className="p-2 border-4 border-white/30 font-semibold hover:bg-red-400">
              Learn More
            </button>

            <button className="p-2 border-4 border-white/30 font-semibold hover:bg-red-400">
              Support Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}