import Image from "next/image";

export default function NavBar() {
    return (
    <div className="bg-primary relative z-40 w-full flex items-center">
      <div className="container">
        <div className="flex -mx-4 items-center justify-between relative">
          <div className="px-4 w-60 max-w-full">
            <a href="/" className="navbar-logo w-full block py-5">
                <Image aria-hidden
                    src="/assets/images/logo/logo-white.svg"
                    alt="logo"
                    className="w-full header-logo"
                    width={0}
                    height={0}/>              
            </a>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <button id="navbarToggler" className="block absolute right-4 top-1/2 -translate-y-1/2 lg:hidden focus:ring-2 ring-primary px-3 py-[6px] rounded-lg">
                <span
                  className="relative w-[30px] h-[2px] my-[6px] block bg-white"
                ></span>
                <span
                  className="relative w-[30px] h-[2px] my-[6px] block bg-white"
                ></span>
                <span
                  className="relative w-[30px] h-[2px] my-[6px] block bg-white"
                ></span>
              </button>
              <nav
                id="navbarCollapse"
                className="absolute py-5 lg:py-0 lg:px-4 xl:px-6 bg-white lg:bg-transparent shadow-lg rounded-lg max-w-[250px] w-full lg:max-w-full lg:w-full right-4 top-full hidden lg:block lg:static lg:shadow-none">
                <ul className="block lg:flex">
                  <li className="relative group">
                    <a
                      href="/"
                      className="
                        ud-menu-scroll
                        text-base text-dark
                        lg:text-white
                        lg:group-hover:opacity-70
                        lg:group-hover:text-white
                        group-hover:text-primary
                        py-2
                        lg:py-6 lg:inline-flex lg:px-0
                        flex
                        mx-8
                        lg:mr-0
                      "
                    >
                      Home
                    </a>
                  </li>
                  <li className="relative group">
                    <a
                      href="/about"
                      className="
                        ud-menu-scroll
                        text-base text-dark
                        lg:text-white
                        lg:group-hover:opacity-70
                        lg:group-hover:text-white
                        group-hover:text-primary
                        py-2
                        lg:py-6 lg:inline-flex lg:px-0
                        flex
                        mx-8
                        lg:mr-0 lg:ml-7
                        xl:ml-12
                      "
                    >
                      About Me
                    </a>
                  </li>
                  <li className="relative group">
                    <a
                      href="/work"
                      className="
                        ud-menu-scroll
                        text-base text-dark
                        lg:text-white
                        lg:group-hover:opacity-70
                        lg:group-hover:text-white
                        group-hover:text-primary
                        py-2
                        lg:py-6 lg:inline-flex lg:px-0
                        flex
                        mx-8
                        lg:mr-0 lg:ml-7
                        xl:ml-12
                      "
                    >
                      Work
                    </a>
                  </li>
                  <li className="relative group">
                    <a
                      href="/resume"
                      className="
                        ud-menu-scroll
                        text-base text-dark
                        lg:text-white
                        lg:group-hover:opacity-70
                        lg:group-hover:text-white
                        group-hover:text-primary
                        py-2
                        lg:py-6 lg:inline-flex lg:px-0
                        flex
                        mx-8
                        lg:mr-0 lg:ml-7
                        xl:ml-12
                      "
                    >
                      Resume
                    </a>
                  </li>
                  <li className="relative group">
                    <a
                      href="/contact"
                      className="
                        ud-menu-scroll
                        text-base text-dark
                        lg:text-white
                        lg:group-hover:opacity-70
                        lg:group-hover:text-white
                        group-hover:text-primary
                        py-2
                        lg:py-6 lg:inline-flex lg:px-0
                        flex
                        mx-8
                        lg:mr-0 lg:ml-7
                        xl:ml-12
                      "
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
}