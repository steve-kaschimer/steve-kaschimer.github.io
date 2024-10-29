
export default function ContactForm() {
    return (
      <div className="container pb-4 w-full">
        <div className="flex flex-wrap items-center">
          <div className="px-4 py-4 w-full h-full lg:w-7/12 xl:w-8/12">
            <div className="">
              <div className="mb-24 ">
                <span
                  className="
                    font-headingFont
                    text-dark
                    font-semibold
                    text-base
                    mb-5
                  "
                >
                  CONTACT ME
                </span>
                <h2 className="text-3xl font-semibold mb-6">
                  Let's talk about:
                </h2>
                <ul className="list-disc ml-6">
                  <li className="text-xl">Cloud</li>
                  <li className="text-xl">DevOps</li>
                  <li className="text-xl">Custom Development</li>
                  <li className="text-xl">Data and Analytics</li>
                  <li className="text-xl">Your Next Big Thing</li>
                </ul>
              </div>
              <div className="flex flex-wrap justify-between mb-12 lg:mb-0">
                <div className="flex max-w-full w-[330px] mb-8">
                  <div className="text-[32px] text-primary mr-6">
                    <svg
                      width="29"
                      height="35"
                      viewBox="0 0 29 35"
                      className="fill-current"
                    >
                      <path
                        d="M14.5 0.710938C6.89844 0.710938 0.664062 6.72656 0.664062 14.0547C0.664062 19.9062 9.03125 29.5859 12.6406 33.5234C13.1328 34.0703 13.7891 34.3437 14.5 34.3437C15.2109 34.3437 15.8672 34.0703 16.3594 33.5234C19.9688 29.6406 28.3359 19.9062 28.3359 14.0547C28.3359 6.67188 22.1016 0.710938 14.5 0.710938ZM14.9375 32.2109C14.6641 32.4844 14.2812 32.4844 14.0625 32.2109C11.3828 29.3125 2.57812 19.3594 2.57812 14.0547C2.57812 7.71094 7.9375 2.625 14.5 2.625C21.0625 2.625 26.4219 7.76562 26.4219 14.0547C26.4219 19.3594 17.6172 29.2578 14.9375 32.2109Z"
                      />
                      <path
                        d="M14.5 8.58594C11.2734 8.58594 8.59375 11.2109 8.59375 14.4922C8.59375 17.7188 11.2187 20.3984 14.5 20.3984C17.7812 20.3984 20.4062 17.7734 20.4062 14.4922C20.4062 11.2109 17.7266 8.58594 14.5 8.58594ZM14.5 18.4297C12.3125 18.4297 10.5078 16.625 10.5078 14.4375C10.5078 12.25 12.3125 10.4453 14.5 10.4453C16.6875 10.4453 18.4922 12.25 18.4922 14.4375C18.4922 16.625 16.6875 18.4297 14.5 18.4297Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold mb-6">My Location</h5>
                    <p className="text-base text-body-color">
                      <a href="https://www.bing.com/ck/a?!&&p=24a88664bde84455JmltdHM9MTczMDE2MDAwMCZpZ3VpZD0wZjM1MGFlYS0xOWJkLTZiNzgtM2IxOC0xZTQxMTgyNDZhZDQmaW5zaWQ9NTQ3MQ&ptn=3&ver=2&hsh=3&fclid=0f350aea-19bd-6b78-3b18-1e4118246ad4&u=a1L21hcHM_Jm1lcGk9MTA5fn5Ub3BPZlBhZ2V-QWRkcmVzc19MaW5rJnR5PTE4JnE9U2xhbG9tJTIwQ29uc3VsdGluZyZzcz15cGlkLllOODczeDE0MTA5MDgzNjcxMDAyNDMzNDI5JnBwb2lzPTQyLjMzMTEwMDQ2Mzg2NzE5Xy04My4wNDU4OTg0Mzc1X1NsYWxvbSUyMENvbnN1bHRpbmdfWU44NzN4MTQxMDkwODM2NzEwMDI0MzM0Mjl-JmNwPTQyLjMzMTF-LTgzLjA0NTg5OCZ2PTImc1Y9MSZGT1JNPU1QU1JQTA&ntb=1" target="_blank" rel="noreferrer">660 Woodward Ave Ste 1975 <br/>
                      Detroit, MI 48226</a>
                    </p>
                  </div>
                </div>
                <div className="flex max-w-full w-[330px] mb-8">
                  <div className="text-[32px] text-primary mr-6">
                    <svg
                      width="34"
                      height="25"
                      viewBox="0 0 34 25"
                      className="fill-current"
                    >
                      <path
                        d="M30.5156 0.960938H3.17188C1.42188 0.960938 0 2.38281 0 4.13281V20.9219C0 22.6719 1.42188 24.0938 3.17188 24.0938H30.5156C32.2656 24.0938 33.6875 22.6719 33.6875 20.9219V4.13281C33.6875 2.38281 32.2656 0.960938 30.5156 0.960938ZM30.5156 2.875C30.7891 2.875 31.0078 2.92969 31.2266 3.09375L17.6094 11.3516C17.1172 11.625 16.5703 11.625 16.0781 11.3516L2.46094 3.09375C2.67969 2.98438 2.89844 2.875 3.17188 2.875H30.5156ZM30.5156 22.125H3.17188C2.51562 22.125 1.91406 21.5781 1.91406 20.8672V5.00781L15.0391 12.9922C15.5859 13.3203 16.1875 13.4844 16.7891 13.4844C17.3906 13.4844 17.9922 13.3203 18.5391 12.9922L31.6641 5.00781V20.8672C31.7734 21.5781 31.1719 22.125 30.5156 22.125Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold mb-6">How Can I Help?</h5>
                    <p className="text-base text-body-color"><a href="mailto:steve.kaschimer@slalom.com">steve.kaschimer@slalom.com</a></p>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 w-full lg:w-5/12 xl:w-4/12">
            <div
              className="
                shadow-testimonial
                rounded-lg
                bg-white
                py-10
                px-8
                md:p-[60px]
                lg:p-10
                2xl:p-[60px]
                sm:py-12 sm:px-10
                lg:py-12 lg:px-10
                wow
                fadeInUp
              "
              data-wow-delay=".2s"
            >
              <h3 className="font-semibold mb-8 text-2xl md:text-[26px]">
                Send us a Message
              </h3>
              <form>
                <div className="mb-6">
                  <label htmlFor="fullName" className="block text-xs text-dark"
                    >Full Name*</label
                  >
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Adam Gelius"
                    className="
                      w-full
                      border-0 border-b border-[#f1f1f1]
                      focus:border-primary focus:outline-none
                      py-4
                    "
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-xs text-dark"
                    >Email*</label
                  >
                  <input
                    type="email"
                    name="email"
                    placeholder="example@yourmail.com"
                    className="
                      w-full
                      border-0 border-b border-[#f1f1f1]
                      focus:border-primary focus:outline-none
                      py-4
                    "
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="phone" className="block text-xs text-dark"
                    >Phone*</label
                  >
                  <input
                    type="text"
                    name="phone"
                    placeholder="+885 1254 5211 552"
                    className="
                      w-full
                      border-0 border-b border-[#f1f1f1]
                      focus:border-primary focus:outline-none
                      py-4
                    "
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-xs text-dark"
                    >Message*</label
                  >
                  <textarea
                    name="message"
                    rows="1"
                    placeholder="type your message here"
                    className="
                      w-full
                      border-0 border-b border-[#f1f1f1]
                      focus:border-primary focus:outline-none
                      py-4
                      resize-none
                    "
                  ></textarea>
                </div>
                <div className="mb-0">
                  <button
                    type="submit"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      py-4
                      px-6
                      rounded
                      text-white
                      bg-primary
                      text-base
                      font-medium
                      hover:bg-dark
                      transition
                      duration-300
                      ease-in-out
                    "
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
}