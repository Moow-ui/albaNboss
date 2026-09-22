// scripts/record-wage-baseline.js
// 단계 1: 사장님 시급 계산기 기준 결과 기록 및 검증

const WageCore = require('../assets/js/wage-core.js');

console.log('=== [단계 1] 사장님 시급 계산기 기준 결과 산출 ===\n');

function computeFullWage(params) {
  const result = WageCore.calculateWage(params);
  const severanceMonthlyReserve = Math.round(result.세전총액 * 0.0833);
  const employerTotalCostWithSeverance = result.총인건비 + severanceMonthlyReserve;
  return {
    ...result,
    퇴직금월적립: severanceMonthlyReserve,
    사업주총인건비최종: employerTotalCostWithSeverance,
  };
}

// 1. 대표 캡처 기준 입력값 (사장님용, 시급 10,320원, 1주 소정근로 40시간, 주 5일, 5인 이상 기본값)
const bossCase = {
  hourlyWage: 10320,
  weeklyHours: 40,
  workDaysPerWeek: 5,
  workplaceScale: '5orMore',
  overtimeHours: 0,
  nightHours: 0,
  holidayHours: 0,
  insuranceType: 'fourMajor'
};

const bossRes = computeFullWage(bossCase);

console.log('--- [Case 1: 사장님용 기본값 (시급 10,320원, 주 40시간, 주 5일, 5인 이상)] ---');
console.log('예상 총 인건비:', bossRes.사업주총인건비최종.toLocaleString('ko-KR') + '원');
console.log('근로자 세전 급여:', bossRes.세전총액.toLocaleString('ko-KR') + '원');
console.log('사업주 4대보험 부담:', bossRes.사업주부담.합계.toLocaleString('ko-KR') + '원');
console.log('퇴직금 월 적립:', bossRes.퇴직금월적립.toLocaleString('ko-KR') + '원');
console.log('근로자 세후 실수령액:', bossRes.실수령액.toLocaleString('ko-KR') + '원');
console.log('근로자 4대보험 공제:', bossRes.근로자공제.합계.toLocaleString('ko-KR') + '원');

// 대표 캡처 기준 값과 대조:
// 예상 총 인건비 2,577,798원 / 근로자 세전 급여 2,152,339원 / 사업주 4대보험 부담 246,169원 / 퇴직금 월 적립 179,290원
const expected = {
  totalEmployerCost: 2577798,
  totalGrossPay: 2152339,
  employerInsuranceTotal: 246169,
  monthlySeveranceAccrual: 179290
};

let match = true;
if (bossRes.사업주총인건비최종 !== expected.totalEmployerCost) match = false;
if (bossRes.세전총액 !== expected.totalGrossPay) match = false;
if (bossRes.사업주부담.합계 !== expected.employerInsuranceTotal) match = false;
if (bossRes.퇴직금월적립 !== expected.monthlySeveranceAccrual) match = false;

if (match) {
  console.log('\n✅ 대표 캡처 기준 값과 100% 일치합니다!');
} else {
  console.error('\n❌ 대표 캡처 기준 값과 불일치 발생!');
  console.error('실제:', {
    totalEmployerCost: bossRes.사업주총인건비최종,
    totalGrossPay: bossRes.세전총액,
    employerInsuranceTotal: bossRes.사업주부담.합계,
    monthlySeveranceAccrual: bossRes.퇴직금월적립
  });
  process.exit(1);
}

// 2. 같은 입력으로 알바생용 탭 결과
console.log('\n--- [Case 2: 알바생용 탭 (같은 입력값 기준)] ---');
console.log('근로자 예상 월 실수령액 (세후):', bossRes.실수령액.toLocaleString('ko-KR') + '원');
console.log('세전 총 급여:', bossRes.세전총액.toLocaleString('ko-KR') + '원');
console.log('총 공제액:', bossRes.근로자공제.합계.toLocaleString('ko-KR') + '원');
console.log('  - 국민연금 (4.75%):', bossRes.근로자공제.국민연금.toLocaleString('ko-KR') + '원');
console.log('  - 건강보험 (3.595%):', bossRes.근로자공제.건강보험.toLocaleString('ko-KR') + '원');
console.log('  - 노인장기요양 (건보의 13.14%의 50%):', bossRes.근로자공제.장기요양.toLocaleString('ko-KR') + '원');
console.log('  - 고용보험 (0.9%):', bossRes.근로자공제.고용보험.toLocaleString('ko-KR') + '원');

// 3. 주 15시간 · 사업장 규모 다른 값 (5인 미만) 결과
const case3 = {
  hourlyWage: 10320,
  weeklyHours: 15,
  workDaysPerWeek: 3,
  workplaceScale: 'under5',
  overtimeHours: 0,
  nightHours: 0,
  holidayHours: 0,
  insuranceType: 'fourMajor'
};

const res3 = computeFullWage(case3);
console.log('\n--- [Case 3: 주 15시간 · 5인 미만 (시급 10,320원, 주 3일)] ---');
console.log('예상 총 인건비:', res3.사업주총인건비최종.toLocaleString('ko-KR') + '원');
console.log('근로자 세전 급여:', res3.세전총액.toLocaleString('ko-KR') + '원');
console.log('  - 기본급:', res3.기본급.toLocaleString('ko-KR') + '원');
console.log('  - 주휴수당:', res3.주휴수당.toLocaleString('ko-KR') + '원');
console.log('근로자 세후 실수령액:', res3.실수령액.toLocaleString('ko-KR') + '원');
console.log('근로자 4대보험 공제:', res3.근로자공제.합계.toLocaleString('ko-KR') + '원');
console.log('사업주 4대보험 부담:', res3.사업주부담.합계.toLocaleString('ko-KR') + '원');
console.log('퇴직금 월 적립:', res3.퇴직금월적립.toLocaleString('ko-KR') + '원');

