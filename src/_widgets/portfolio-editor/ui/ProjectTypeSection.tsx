"use client"

import "./project-type-section.scss"

export type ProjectType = "personal" | "team"

interface Props {
  value: ProjectType | null
  error?: string
  onChange: (value: ProjectType) => void
}

const PROJECT_TYPES = [
  {
    id: "personal" as ProjectType,
    label: "개인 프로젝트",
    desc: "혼자 기획·개발한 프로젝트",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "team" as ProjectType,
    label: "팀 프로젝트",
    desc: "팀원들과 함께 진행한 프로젝트",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="15" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 19c0-3.314 2.686-6 6-6h0c1.38 0 2.65.467 3.657 1.247" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 19c0-2.761 2.239-5 5-5h0c2.761 0 5 2.239 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function ProjectTypeSection({ value, error, onChange }: Props) {
  return (
    <section className="pw-section" id="field-projectType">
      <div className="pw-section__head">
        <span className="pw-section__label">프로젝트 유형</span>
        <span className="pw-section__required">필수</span>
      </div>
      <div className="pw-project-types">
        {PROJECT_TYPES.map((pt) => (
          <button
            key={pt.id}
            type="button"
            className={`pw-project-type${value === pt.id ? " pw-project-type--active" : ""}`}
            onClick={() => onChange(pt.id)}
          >
            <span className="pw-project-type__icon">{pt.icon}</span>
            <span className="pw-project-type__label">{pt.label}</span>
            <span className="pw-project-type__desc">{pt.desc}</span>
            {value === pt.id && (
              <span className="pw-project-type__check" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
      {error && <p className="pw-error">{error}</p>}
    </section>
  )
}
