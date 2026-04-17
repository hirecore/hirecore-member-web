// _entities/resume/model | 이력서 도메인 타입 정의
// ui가 아닌 model이 타입 소유자 — ui는 이 타입을 소비만 한다

import type { ManagedDocument } from "@/_shared/model"

export type ManagedResume = ManagedDocument
