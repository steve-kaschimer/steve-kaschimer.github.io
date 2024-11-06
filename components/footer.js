import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <div className="bg-gray-100 pt-2">
      <div className="flex pb-5 px-3 m-auto pt-5 border-t text-gray-800 text-sm flex-col
      max-w-screen-lg items-center">
        <div className="md:flex-auto md:flex-row-reverse mt-2 flex-row flex">
          <a href="https://github.com/steve-kaschimer" className="w-6 mx-1">
            <FontAwesomeIcon icon={faGithub} className="fas fa-check text-primary" />
          </a>
          <a href="https://www.linkedin.com/in/skaschimer" className="w-6 mx-1">
          <FontAwesomeIcon icon={faLinkedin} className="fas fa-check text-primary" />
          </a>
        </div>
        <div className="my-5">© Copyright 2024. All Rights Reserved.</div>
      </div>
    </div>
  )
}