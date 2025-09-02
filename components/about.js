import Icon from '@mdi/react';
import { mdiTwitter, mdiLinkedin, mdiEmailOutline, mdiCellphone, mdiReact, mdiCertificate  } from '@mdi/js';


export default function About() {
    return (
        <section
            id="about"
            className="py-6"
        >
            <div className="container">
                <h1 className="text-3xl my-4" id="hi-i-m-your-name-">Hi, I&apos;m Steve!</h1>
                <p className="mb-4">I&apos;ve been in this industry for over 20 years, and never have had a day where I learn nothing. I love to challenge myself by learning new things. All. The. Time. I&apos;m a proud Senior Consultant with Slalom, and love the variety of projects that I am privileged to work on.</p>
                <p className="mb-4"><img src="https://github-readme-stats.vercel.app/api?username=steve-kaschimer&theme=vue-dark&show_icons=true&hide_border=true&count_private=true" alt="Steve&apos;s Stats" /></p>
                <h2 className="text-2xl mb-4" id="-about-me">About Me</h2>
                <ul className="list-disc mb-4">
                    <li className="mx-6">I have a B.S. in Computer Information Systems and a M.S. in Information Management, both from Arizona State University (Go Sun Devils!).</li>
                    <li className="mx-6">I volunteer my time outside of work to various causes that mean something to me including: <a className="underline" href="https://www.forgottenharvest.org" target="_blank" rel="noreferrer">Forgotten Harvest</a>, <a className="underline" href="https://pack248.org" target="_blank" rel="noreferrer">Cub Scout Pack 248</a>, <a className="underline" href="https://scouting.org" target="_blank" rel="noreferrer">Boy Scouts of America</a>, and <a className="underline" href="https://freedomaintfree.us" target="_blank" rel="noreferrer">#32 Freedom Ain&apos;t Free</a></li>
                    <li className="mx-6">I have a family full of boys... 5 of them to be precise... two extrememly sweet Golden Doodles... and a loving wife who puts up with all of us!</li>
                    <li className="mx-6">My favorite place to vacation is Holland, MI. You can find me there every summer with my family on the beach soaking up the sun and disconnecting from technology.</li>
                    <li className="mx-6">Opinions expressed are my own. Endorsements will be explicitly stated. </li>
                </ul>
                <h2 className="text-2xl mb-4 flex text-primary"><Icon className="pt-1" path={mdiCertificate} size={1.2} /> <p className="ml-2 text-black">Certifications</p></h2>
                <ul className="list-none mb-4">
                    <li className="ml-6 font-semibold">Earned</li>
                    <li className="ml-6"><a className="hover:underline" href="https://learn.microsoft.com/en-us/users/stevekaschimer-0933/credentials/certification/azure-fundamentals" target="_blank" rel="noreferrer">AZ-900 Azure Fundamentals - Jan 17, 2020</a></li>
                    <li className="ml-6"><a className="hover:underline" href="https://learn.microsoft.com/en-us/users/stevekaschimer-0933/credentials/certification/azure-data-fundamentals?tab=credentials-tab" target="_blank" rel="noreferrer">DP-900 Azure Data Fundamentals - May 16, 2023</a></li>
                    <li className="ml-6"><a classNamw="hover:underline" href="https://www.credly.com/badges/bbce5fff-76e0-4879-bfc4-5bf8c4390077/public_url" target="_blank" rel="noreferrer">GitHub Foundations - February 21, 2025</a></li>
                    <li className="ml-6 font-semibold">Queued Up</li>
                    <li className="ml-6">GitHub Actions</li>
                    <li className="ml-6">GitHub Administration</li>
                    <li className="ml-6">GitHub Advanced Security</li>
                    <li className="ml-6">GitHub Administration</li>
                    <li className="ml-6">GitHub Copilot</li>
                    <li className="ml-6">Microsoft - DevOps Engineer Expert</li>
                </ul>
                <h2 className="text-2xl mb-4" id="tech-stack">Tech Stack</h2>
                <p className="mb-4"><a href="https://skillicons.dev"><img src="https://skillicons.dev/icons?i=azure,cs,dotnet,windows,ubuntu,visualstudio,vscode,docker,js,html,css,react,nextjs,gatsby,github,githubactions,md,npm,py,postman,nodejs,notion,powershell,tailwind,terraform,ts,rabbitmq,raspberrypi,linkedin,devto,stackoverflow&perline=8" alt="My Skills" /></a></p>
                <h2 className="text-2xl mb-4" id="-currently-working-on">Currently Working On</h2>
                <ul className="list-none mb-4">
                    <li className="ml-6">A sweet DevOps project using GitHub, IaC, Azure, and AI</li>
                    <li className="ml-6">This GitHub Pages project using GitHub and Next.js</li>
                    <li className="ml-6">Pack 248&apos;s website (in my free time between midnight and 6am)</li>
                    <li className="ml-6">#32 Freedom Ain&apos;t Free&apos;s website (on the weekends)</li>
                </ul>
                <h2 className="text-2xl mb-4" id="-currently-exploring">🌱 Currently Exploring</h2>
                <ul className="list-none mb-4">
                    <li className="mx-6 flex text-primary"><Icon path={mdiReact} size={1} /><p className="ml-4 text-black">Learning Full Stack Web Development</p>

                    </li>
                </ul>
                <ul className="list-disc ml-4 text-black mb-4">
                    <li className="mx-12">Exploring the ins and outs of React and Next.js for dynamic front-end experiences.</li>
                    <li className="mx-12">Navigating through the world of Routers for seamless page transitions.</li>
                    <li className="mx-12">Styling with Tailwind CSS to create modern and responsive user interfaces.</li>
                    <li className="mx-12">Building server-side applications with C# and .NET.</li>
                    <li className="mx-12">Diving into API design and development for efficient and scalable services.</li>
                </ul>
                <h2 className="text-2xl mb-4" id="-ask-me-about">💬 Ask Me About</h2>
                <ul className="list-none mb-4">
                    <li className="mx-6"><p>Anything related to: Cloud (Azure), DevOps, GitHub, .NET, Software Development</p></li>
                </ul>
                <h2 className="text-2xl mb-4" id="-pronouns">😄 Pronouns</h2>
                <ul className="list-none mb-4">
                    <li className="mx-6"><p>He / Him / His</p></li>
                </ul>
                <h2 className="text-2xl mb-4" id="-fun-fact">⚡ Fun fact</h2>
                <ul className="list-none mb-4">
                    <li className="mx-6"><p>Once upon a time, I got paid to break into houses... as a locksmith!</p></li>
                </ul>
                <h2 className="text-2xl mb-4" id="-get-in-touch">📬 Get in Touch</h2>
                <ul className="list-none mb-4">
                    <li className="mx-6 flex text-primary"><Icon path={mdiTwitter} size={.9} /><span className="ml-4 text-black">Connect with me on <a className="hover:underline" href="https://twitter.com/iamskratsch" target="_blank" rel="noreferrer">Twitter</a></span></li>
                    <li className="mx-6 flex text-primary"><Icon path={mdiLinkedin} size={.9} /><span className="ml-4 text-black">Connect with me on <a className="hover:underline" href="https://www.linkedin.com/in/skaschimer/" target="_blank" rel="noreferrer">LinkedIn</a></span></li>
                    <li className="mx-6 flex text-primary"><Icon path={mdiEmailOutline} size={.9} /><span className="ml-4 text-black"><a className="hover:underline" href="mailto:steve.kaschimer@slalom.com">Email me</a></span></li>
                    <li className="mx-6 flex text-primary"><Icon path={mdiCellphone} size={.9} /><span className="ml-4 text-black"><a className="hover:underline" href="tel:13132845656">Call me</a></span></li>
                </ul>
                <p className="mb-4">Thanks for stopping by! Let&apos;s connect and explore the fascinating world of technology together. Maybe Slalom can help play a part in your Next Big Thing</p>
            </div>
        </section>
    );
}
