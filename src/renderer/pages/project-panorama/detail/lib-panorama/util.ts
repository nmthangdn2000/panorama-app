export const calculateEndPosition = (xA: number, yA: number, radian: number, radius: number) => {
  const xO = 40;
  const yO = 40;

  const xVectorOA = xA - xO;
  const yVectorOA = yA - yO;

  // xVectorOA * xVectorOB + yVectorOA * yVectorOB = 20 * 20 * Math.cos(radian);

  // yVectorOB = (20 * 20 * Math.cos(radian) - xVectorOA * xVectorOB) / yVectorOA;

  // xVectorOB^2 + yVectorOB^2 = 20^2

  // xVectorOB^2 + ((20 * 20 * Math.cos(radian) - xVectorOA * xVectorOB) / yVectorOA)^2 = 20^2

  // yVectorOA^2 * xVectorOB^2 + (20 * 20 * Math.cos(radian) - xVectorOA * xVectorOB)^2 - 20^2 * yVectorOA^2 = 0

  // yVectorOA^2 * xVectorOB^2 + xVectorOA^2 * xVectorOB^2 - 2 * 20 * 20 * Math.cos(radian) * xVectorOA * xVectorOB + 20^2 * 20^2 * Math.cos(radian)^2 - 20^2 * yVectorOA^2 = 0

  // (yVectorOA^2 + xVectorOA^2) * xVectorOB^2 - 2 * 20 * 20 * Math.cos(radian) * xVectorOA * xVectorOB + 20^2 * 20^2 * Math.cos(radian)^2 - 20^2 * yVectorOA^2 = 0

  // a = yVectorOA^2 + xVectorOA^2
  // b = -2 * 20 * 20 * Math.cos(radian) * xVectorOA
  // c = 20^2 * 20^2 * Math.cos(radian)^2 - 20^2 * yVectorOA^2

  // delta = b^2 - 4 * a * c

  // xVectorOB = (-b + Math.sqrt(delta)) / (2 * a)
  // yVectorOB = (20 * 20 * Math.cos(radian) - xVectorOA * xVectorOB) / yVectorOA;

  // xB = xO + xVectorOB;
  // yB = yO + yVectorOB;

  const finalRadian = radian - Math.floor(radian / (Math.PI * 2)) * Math.PI * 2;

  const a = yVectorOA ** 2 + xVectorOA ** 2;
  const b = -2 * radius * radius * Math.cos(finalRadian) * xVectorOA;
  const c = radius ** 2 * radius ** 2 * Math.cos(finalRadian) ** 2 - radius ** 2 * yVectorOA ** 2;

  const delta = b ** 2 - 4 * a * c;

  let modifierDelta = -1;
  if (finalRadian < Math.PI) modifierDelta = 1;

  const xVectorOB = (-b + modifierDelta * Math.sqrt(delta)) / (2 * a);
  const yVectorOB = (radius * radius * Math.cos(finalRadian) - xVectorOA * xVectorOB) / yVectorOA;

  const xB = xO + xVectorOB;
  const yB = yO + yVectorOB;

  return [xB, yB];
};
