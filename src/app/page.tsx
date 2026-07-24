import { ArrowRight, User, Star, Heart, Mail, Clock } from "lucide-react";
import { Github, Instagram } from "@/components/brand-icons";
import SiteMenu from "@/components/site-menu";
import ThemeToggle from "@/components/theme-toggle";
import Hero from "@/components/hero";
import HobbiesScroll from "@/components/hobbies-scroll";
import ContactForm from "@/components/contact-form";
import LocalTime from "@/components/local-time";
import ScrollToHash from "@/components/scroll-to-hash";
import TiltPortrait from "@/components/tilt-portrait";
import ProjectFolder from "@/components/project-folder";

export default function Home() {
  return (
    <>
      <ScrollToHash />
      <SiteMenu />
      <ThemeToggle />
      {/* Scroll runway for the sideways hero handoff — see globals.css. */}
      <div className="hero-runway">
        <Hero />
      </div>
      {/* Film-grain wash over the whole page (fixed, non-interactive). */}
      <div className="grain" aria-hidden="true" />

      {/* CONTENT scrolls up and takes over the hero */}
      <main className="content">
        {/* ABOUT */}
        <section className="section section--glow about" id="about">
          <div className="container about__grid">
            <div className="about__left stagger">
              <TiltPortrait />

              <div className="card">
                <h3 className="card__title">Philosophy</h3>
                <ul className="values">
                  <li className="value">
                    <span className="value__icon" aria-hidden="true">
                      <User />
                    </span>
                    <div>
                      <h4 className="value__title">Family-Driven</h4>
                      <p className="value__text">
                        Everything I pursue is grounded in my family and the
                        people who shaped me.
                      </p>
                    </div>
                  </li>
                  <li className="value">
                    <span className="value__icon" aria-hidden="true">
                      <Star />
                    </span>
                    <div>
                      <h4 className="value__title">Dream Big</h4>
                      <p className="value__text">
                        For my entire life I have always been the type to
                        dream big and chase goals bigger than myself.
                      </p>
                    </div>
                  </li>
                  <li className="value">
                    <span className="value__icon" aria-hidden="true">
                      <Heart />
                    </span>
                    <div>
                      <h4 className="value__title">Authenticity</h4>
                      <p className="value__text">
                        I always strive to be genuine, kind, and respectful to
                        everyone around me no matter who it is.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="about__right stagger">
              <p className="eyebrow">About Me</p>
              <h2 className="section__title">
                A family-driven student who{" "}
                <span className="ital">dreams big</span>
              </h2>
              <p className="lede">
                Hey! I&rsquo;m Ethan Miclat and I am currently a student at
                the University of Arkansas&rsquo; Walton Honors College of
                Business. I am majoring in Finance while on a pre-dental
                track (taking prerequisites for dental school as well). Thank
                You for visiting my website I hope you enjoy!
              </p>

              <div className="timeline reveal">
                <h3 className="timeline__label">The Journey</h3>
                <ol className="timeline__list">
                  <li className="timeline__item">
                    <span
                      className="timeline__dot timeline__dot--active"
                      aria-hidden="true"
                    />
                    <span className="timeline__time">Now</span>
                    <h4 className="timeline__title">
                      University of Arkansas, Walton Honors College of
                      Business
                    </h4>
                    <p className="timeline__text">
                      Business&nbsp;Finance track, pursuing a pre-dental path.
                    </p>
                  </li>
                  <li className="timeline__item">
                    <span className="timeline__dot" aria-hidden="true" />
                    <span className="timeline__time">2022</span>
                    <h4 className="timeline__title">Graduated High School</h4>
                  </li>
                  <li className="timeline__item">
                    <span className="timeline__dot" aria-hidden="true" />
                    <span className="timeline__time">Dec 19, 2005</span>
                    <h4 className="timeline__title">Where my story began</h4>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* HOBBIES — full-screen carousel (arrows / dots move between hobbies) */}
        <section className="hobbies section--alt" id="hobbies">
          <HobbiesScroll />
          <div className="container hobbies__outro">
            <div className="quote-block reveal">
              <span className="quote-rule" aria-hidden="true" />
              <p className="quote-text">
                &ldquo;Dream big, stay genuine, and be a good person.&rdquo;
              </p>
              <span className="quote-rule" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="section section--glow projects" id="projects">
          <div className="container">
            <div className="section__head section__head--left stagger">
              <p className="eyebrow">Selected Works</p>
              <h2 className="projects__headline">Projects</h2>
            </div>

            <div className="reveal">
              <ProjectFolder />
            </div>

            <div className="projects__actions reveal">
              <a
                className="pill pill--cream"
                href="https://github.com/ethanmiclat"
                target="_blank"
                rel="noopener"
                data-link="github"
              >
                <Github className="pill__icon" aria-hidden="true" />
                GitHub
              </a>
            </div>

            <div className="projects__cta reveal">
              <h3 className="projects__cta-title">Interested in connecting?</h3>
              <p className="projects__cta-text">
                I&rsquo;m always open to new opportunities, ideas, and
                conversations.
              </p>
              <a className="pill pill--cream" href="#contact">
                Contact Me
                <ArrowRight className="pill__icon" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="section section--alt contact" id="contact">
          <div className="container">
            <div className="contact__grid">
              <div className="contact__intro stagger">
                <p className="eyebrow">Get in touch</p>
                <h2 className="contact__title">
                  Let&rsquo;s <span className="ital">Connect</span>
                </h2>
                <p className="lede">
                  Whether you have a question, an opportunity, or just want to
                  say hello, I&rsquo;m always open to a good conversation.
                </p>
                <div className="contact__socials">
                  <a
                    className="contact__social"
                    href="https://github.com/ethanmiclat"
                    target="_blank"
                    rel="noopener"
                    data-link="github"
                  >
                    GitHub
                    <Github aria-hidden="true" />
                  </a>
                  <a
                    className="contact__social"
                    href="https://www.instagram.com/ethanmiclat/"
                    target="_blank"
                    rel="noopener"
                    data-link="instagram"
                  >
                    Instagram
                    <Instagram aria-hidden="true" />
                  </a>
                </div>
              </div>

              <ContactForm />
            </div>
          </div>
        </section>

        {/* LOCATION */}
        <section className="section location" id="location">
          <div className="container location__grid">
            <div className="location__info stagger">
              <span className="eyebrow">Location</span>
              <h3 className="location__title">
                Based in Fayetteville, Arkansas
              </h3>
              <p className="body-text">
                Studying at the University of Arkansas, and open to
                opportunities and always happy to connect.
              </p>
              <div className="location__lines">
                <div className="location__line">
                  <Mail aria-hidden="true" />
                  <a className="link-underline" href="mailto:ethanmic6@gmail.com">
                    ethanmic6@gmail.com
                  </a>
                </div>
                <div className="location__line">
                  <Clock aria-hidden="true" />
                  <span>
                    Local time: <LocalTime />
                  </span>
                </div>
              </div>
            </div>

            <div className="location__media reveal">
              <div className="location__photo" />
              <span className="location__coords">
                36.0764&deg; N, 94.2088&deg; W
              </span>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="site-footer">
          <div className="container site-footer__inner">
            <a className="site-footer__brand" href="#home">
              Ethan Miclat
            </a>
            <nav className="site-footer__nav" aria-label="Footer">
              <a href="#about">About</a>
              <a href="#hobbies">Hobbies</a>
              <a href="#projects">Projects</a>
              <a href="#contact">Contact</a>
            </nav>
            <p className="site-footer__copy">&copy; 2026 Ethan Miclat</p>
          </div>
        </footer>
      </main>
    </>
  );
}
