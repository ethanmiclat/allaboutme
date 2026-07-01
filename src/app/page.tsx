import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  User,
  Star,
  Heart,
  Music,
  Trophy,
  Gamepad2,
  Clapperboard,
  FileText,
  Mail,
  Clock,
} from "lucide-react";
import { Github, Linkedin, Instagram } from "@/components/brand-icons";
import SiteMenu from "@/components/site-menu";
import Hero from "@/components/hero";
import ContactForm from "@/components/contact-form";
import LocalTime from "@/components/local-time";
import ScrollToHash from "@/components/scroll-to-hash";

export default function Home() {
  return (
    <>
      <ScrollToHash />
      <SiteMenu />
      <Hero />

      {/* CONTENT scrolls up and takes over the hero */}
      <main className="content">
        {/* ABOUT */}
        <section className="section about" id="about">
          <div className="container about__grid">
            <div className="about__left stagger">
              <div
                className="portrait"
                role="img"
                aria-label="Portrait of Ethan Miclat"
              />

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
                        I aim high and chase goals bigger than myself.
                      </p>
                    </div>
                  </li>
                  <li className="value">
                    <span className="value__icon" aria-hidden="true">
                      <Heart />
                    </span>
                    <div>
                      <h4 className="value__title">Genuine &amp; Good</h4>
                      <p className="value__text">
                        I lead with positivity, honesty, and kindness in
                        everything I do.
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
                I&rsquo;m Ethan Miclat, a student at the University of
                Arkansas&rsquo;s Walton Honors College of Business &mdash; on the
                Business&nbsp;Finance track and pre-dental path.
              </p>
              <p className="body-text" data-placeholder="">
                [Editable: add a few sentences about your story &mdash; what drew
                you to finance and dentistry, what motivates you, and what you
                want people to know about you.]
              </p>

              <div className="timeline">
                <h3 className="timeline__label">The Journey</h3>
                <ol className="timeline__list">
                  <li className="timeline__item">
                    <span
                      className="timeline__dot timeline__dot--active"
                      aria-hidden="true"
                    />
                    <span className="timeline__time">Now</span>
                    <h4 className="timeline__title">
                      University of Arkansas &mdash; Walton Honors College of
                      Business
                    </h4>
                    <p className="timeline__text">
                      Business&nbsp;Finance track, pursuing a pre-dental path.
                    </p>
                  </li>
                  <li className="timeline__item" data-placeholder="">
                    <span className="timeline__dot" aria-hidden="true" />
                    <span className="timeline__time">[Year]</span>
                    <h4 className="timeline__title">[Add a milestone]</h4>
                    <p className="timeline__text">
                      [e.g. a graduation, award, job, leadership role, or
                      volunteer experience.]
                    </p>
                  </li>
                  <li className="timeline__item" data-placeholder="">
                    <span className="timeline__dot" aria-hidden="true" />
                    <span className="timeline__time">[Year]</span>
                    <h4 className="timeline__title">[Add a milestone]</h4>
                    <p className="timeline__text">[Where your story began.]</p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* HOBBIES */}
        <section className="section section--alt hobbies" id="hobbies">
          <div className="container">
            <div className="section__head stagger">
              <p className="eyebrow">Interests &amp; Pursuits</p>
              <h2 className="section__title section__title--center ital">
                The things that move me
              </h2>
            </div>

            <div className="hobby-grid">
              <Link
                className="hobby-card hobby-card--lg reveal"
                href="/hobbies/music"
                aria-label="Open Music"
              >
                <div className="hobby-card__media hobby-card__media--music" />
                <div className="hobby-card__body">
                  <span className="hobby-card__icon" aria-hidden="true">
                    <Music />
                  </span>
                  <h3 className="hobby-card__title ital">Music</h3>
                  <p className="hobby-card__text">Step into the sound.</p>
                  <span className="hobby-card__cta">
                    Explore
                    <ArrowRight aria-hidden="true" />
                  </span>
                </div>
              </Link>

              <Link
                className="hobby-card reveal"
                href="/hobbies/sports"
                aria-label="Open Sports"
              >
                <div className="hobby-card__media" />
                <div className="hobby-card__body">
                  <span className="hobby-card__icon" aria-hidden="true">
                    <Trophy />
                  </span>
                  <h3 className="hobby-card__title ital">Sports</h3>
                  <p className="hobby-card__text">Game on.</p>
                  <span className="hobby-card__cta">
                    Explore
                    <ArrowRight aria-hidden="true" />
                  </span>
                </div>
              </Link>

              <Link
                className="hobby-card reveal"
                href="/hobbies/games"
                aria-label="Open Video Games"
              >
                <div className="hobby-card__media" />
                <div className="hobby-card__body">
                  <span className="hobby-card__icon" aria-hidden="true">
                    <Gamepad2 />
                  </span>
                  <h3 className="hobby-card__title ital">Video Games</h3>
                  <p className="hobby-card__text">Press start.</p>
                  <span className="hobby-card__cta">
                    Explore
                    <ArrowRight aria-hidden="true" />
                  </span>
                </div>
              </Link>

              <Link
                className="hobby-card hobby-card--lg reveal"
                href="/hobbies/films"
                aria-label="Open Films and Movies"
              >
                <div className="hobby-card__media" />
                <div className="hobby-card__body">
                  <span className="hobby-card__icon" aria-hidden="true">
                    <Clapperboard />
                  </span>
                  <h3 className="hobby-card__title ital">
                    Films / Movies
                  </h3>
                  <p className="hobby-card__text">Lights, camera, action.</p>
                  <span className="hobby-card__cta">
                    Explore
                    <ArrowRight aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </div>

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
        <section className="section projects" id="projects">
          <div className="container">
            <div className="section__head section__head--left stagger">
              <p className="eyebrow">Selected Works</p>
              <h2 className="projects__headline">Projects</h2>
            </div>

            <div className="projects__list">
              {/* Featured: Rebel Hauling (live site) */}
              <article className="proj-featured reveal">
                <div className="proj-media proj-media--16x9">
                  <video
                    className="proj-media__video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/assets/rebel-hauling-poster.jpg"
                  >
                    <source src="/assets/rebel-hauling.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="proj-featured__info">
                  <span className="proj__meta">Website</span>
                  <h3 className="proj__title">Rebel Hauling</h3>
                  <p className="proj__desc">
                    Built and deployed a website for a hauling business.
                  </p>
                  <a
                    className="proj__link"
                    href="https://rebelhauling.com"
                    target="_blank"
                    rel="noopener"
                  >
                    Visit Site
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </div>
              </article>

              {/* Staggered pair */}
              <div className="proj-pair">
                <article
                  className="proj-card proj-card--offset reveal"
                  data-placeholder=""
                >
                  <div className="proj-media proj-media--4x5">
                    <div className="proj-media__img" />
                  </div>
                  <span className="proj__meta">[Category / Year]</span>
                  <h3 className="proj__title">[Project name]</h3>
                  <p className="proj__desc">[Short description.]</p>
                  <a className="proj__link-underline" href="#">
                    View Project
                  </a>
                </article>
                <article className="proj-card reveal" data-placeholder="">
                  <div className="proj-media proj-media--4x5">
                    <div className="proj-media__img" />
                  </div>
                  <span className="proj__meta">[Category / Year]</span>
                  <h3 className="proj__title">[Project name]</h3>
                  <p className="proj__desc">[Short description.]</p>
                  <a className="proj__link-underline" href="#">
                    View Project
                  </a>
                </article>
              </div>

              {/* Full-width narrative */}
              <article className="proj-wide reveal" data-placeholder="">
                <div className="proj-media proj-media--21x9">
                  <div className="proj-media__img" />
                </div>
                <div className="proj-wide__info">
                  <span className="proj__meta">[Category / Year]</span>
                  <h3 className="proj__title proj__title--lg">[Project name]</h3>
                  <p className="proj__desc">
                    [A longer description for your flagship project.]
                  </p>
                </div>
              </article>
            </div>

            <div className="projects__actions reveal">
              <a className="pill pill--cream" href="#" data-link="github">
                <Github className="pill__icon" aria-hidden="true" />
                GitHub
              </a>
              <a className="pill pill--ghost" href="#" data-link="resume">
                <FileText className="pill__icon" aria-hidden="true" />
                Résumé
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
                  say hello &mdash; I&rsquo;m always open to a good conversation.
                </p>
                <div className="contact__socials">
                  <a
                    className="contact__social"
                    href="#"
                    data-link="linkedin"
                    data-placeholder=""
                  >
                    LinkedIn
                    <Linkedin aria-hidden="true" />
                  </a>
                  <a
                    className="contact__social"
                    href="#"
                    data-link="github"
                    data-placeholder=""
                  >
                    GitHub
                    <Github aria-hidden="true" />
                  </a>
                  <a
                    className="contact__social"
                    href="#"
                    data-link="instagram"
                    data-placeholder=""
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
                Studying at the University of Arkansas &mdash; open to
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
