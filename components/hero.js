import Image from "next/image";

export default function Hero() {
    return (
        <div className="relative bg-primary">
            <div className="container px-72">
                <div className="flex flex-wrap items-center -mx-4">
                    <div className="w-full px-4 mb-12">
                        <div className="hero-content text-center max-w-[780px] mx-auto">
                            <div className="text-center">
                                
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="mx-auto max-w-[845px] relative z-10">
                            <div className="mt-16">
                                <Image src="/assets/images/hero/hero-image.jpg" alt="hero" className="max-w-full mx-auto rounded-t-xl rounded-tr-xl" height={0} width={780}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}