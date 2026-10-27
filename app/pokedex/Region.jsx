import Link from 'next/link';
import Image from "next/image";

export default function Region({name, link, image, alt}){
    return(

<Link
  href={link}
  className="relative bg-white group hover:text-white hover:bg-blue-300 hover:scale-105 hover:shadow-xl transition-all duration-300 z-20 w-[80vw] md:w-[50vw] h-40 border border-blue-500 rounded-md text-black grid grid-rows-6 overflow-hidden"
>

 <div className="w-full row-span-4 relative overflow-hidden">
    <div className="absolute z-3 w-full h-full bg-black/20 group-hover:bg-transparent duration-300"></div>
  <Image 
    src={image} 
    alt={alt} 
    fill 
    sizes="(max-width: 768px) 80vw, 50vw"
    className="object-cover  w-full h-full"
  />
</div>
  <div className="w-full  row-span-2 flex items-center justify-center text-xl">
    {name}
  </div>
</Link>

    )
}