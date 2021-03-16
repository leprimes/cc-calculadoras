//format currency.
const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// calc1 - calculadora factura persona fisica a persona moral
(function () {
  const calc1 = document.querySelector("#calc1");
  let clear = document.querySelector("#clearContainer");
  let result = document.querySelector("#result");

  let iva = 0.16;
  let rIsr = 0.1;
  let rIva = 0.106667;
  let factor = 1 + iva - rIsr - rIva;

  const Calc = function () {
    const input = calc1.elements.factura.value;

    if (!parseInt(input) || input < 0) {
      result.innerHTML = `<p class="is-size-4">Por favor introduzca una cantidad numerica.</p>`;
    } else {
      let amount = input / factor;

      result.innerHTML = `<table class="table is-striped is-fullwidth">
                    <tr>
                        <td class="is-selected has-text-weight-bold">Debes facturar:</td><td class="is-selected has-text-weight-bold">${moneyFormat.format(
                          amount
                        )}</td>
                    </tr>
                    <tr>
                        <td>(+) IVA:</td><td>${moneyFormat.format(
                          amount * iva
                        )}</td>
                    </tr>
                    <tr>
                        <td>(-) Retencion ISR:</td><td>${moneyFormat.format(
                          amount * rIsr
                        )}</td>
                    </tr>
                    <tr>
                        <td>(-) Retencion IVA:</td><td>${moneyFormat.format(
                          amount * rIva
                        )}</td>
                    </tr>
                    <tr>
                        <td>Tu recibes:</td><td>${moneyFormat.format(
                          input
                        )}</td>
                    </tr>
                </table>`;

      //remove class from clear button so it shows up when you calculate
      clear.classList.remove("displayNone");

      //function to reset the input value and remove the clear button
      clear.addEventListener("click", function () {
        calc1.elements.factura.value = "";
        result.innerHTML = "";
        clear.classList.add("displayNone");
      });
    }
  };

  if (calc1) {
    calc1.addEventListener("submit", function (e) {
      e.preventDefault();
      Calc();
    });
  }
})();

// calc2 - calculadora declaracion anual con ahorro
(function () {
  const calc2 = document.querySelector("#calc2");
  const result = document.querySelector("#result2");
  const clear = document.querySelector("#clearContainer");

  // ranges arrays - income $ from, up to, base tax $, % for rest
  const range1 = [0.01, 5952.84, 0, 0.0192];
  const range2 = [5952.85, 50524.92, 114.29, 0.064];
  const range3 = [50524.93, 88793.04, 2966.91, 0.1088];
  const range4 = [88793.05, 103218.0, 7130.48, 0.16];
  const range5 = [103218.01, 123580.2, 9438.47, 0.1792];
  const range6 = [123580.21, 249243.48, 13087.37, 0.2136];
  const range7 = [249243.49, 392841.96, 39929.05, 0.2352];
  const range8 = [392841.97, 750000, 73703.41, 0.3];
  const range9 = [750000.0, 1000000, 180850.82, 0.32];
  const range10 = [1000000.01, 3000000, 280850.81, 0.34];
  const range11 = [3000000.01, 0, 940850.81, 0.35];

  //function to check which income range person falls under.
  function whichArr(input) {
    if (input < range2[0]) {
      return range1;
    } else if (input < range3[0]) {
      return range2;
    } else if (input < range4[0]) {
      return range3;
    } else if (input < range5[0]) {
      return range4;
    } else if (input < range6[0]) {
      return range5;
    } else if (input < range7[0]) {
      return range6;
    } else if (input < range8[0]) {
      return range7;
    } else if (input < range9[0]) {
      return range8;
    } else if (input < range10[0]) {
      return range9;
    } else if (input < range11[0]) {
      return range10;
    } else if (input > range11[0] + 0.01) {
      return range11;
    }
  }

  //function calc takes the income and the array person belongs to
  //finds the difference between the set fee and the remaining income amnt
  //then calcs the dif by the %, then adds it togther.
  function calc(input, arr) {
    let num1 = arr[2];
    let num2 = input - arr[0];
    num2 *= arr[3];
    return num1 + num2;
  }

  calc2.addEventListener("submit", function (e) {
    e.preventDefault();
    clear.classList.remove("displayNone");

    const incomeInput = calc2.elements.income.value;
    const savingsInput = calc2.elements.savings.value;

    //figure out 10% of person's income
    const ded10 = parseInt(incomeInput * 0.1);
    //current Uma
    const dedUma = 163466.88;

    //check if income input is empty,a negative or not a valid number
    if (!parseInt(incomeInput) || incomeInput < 0) {
      result.innerHTML =
        "<p class='has-text-danger'>Campo Obligatorio. Por favor ingrese sólo dígitos numéricos.</p>";
      throw new Error();
    }
    //check if savings input is used, if it is, make sure it's a valid positive number
    //then check if savings is larger than income.
    if (savingsInput) {
      if (!parseInt(savingsInput) || savingsInput < 0) {
        result.innerHTML =
          "Por favor ingrese sólo dígitos numéricos para ambos campos.";
        throw new Error();
      } else {
        if (parseInt(savingsInput) > parseInt(incomeInput)) {
          result.innerHTML =
            "<p>Monto de retiro no puede superar el ingreso.</p>";
          throw new Error();
        }
      }
    }

    //function to check the cap on tax deduction we can apply.
    function deduction() {
      if (!savingsInput) {
        return 0;
      }
      if (savingsInput <= ded10 && savingsInput <= dedUma) {
        return savingsInput;
      }
      if (savingsInput >= ded10 && ded10 <= dedUma) {
        return ded10;
      } else {
        return dedUma;
      }
    }

    //grab income range array for person with no retiring plan
    const regArr = whichArr(incomeInput);
    //grab income range array for person WITH retiring plan
    const savArr = whichArr(incomeInput - deduction());
    //lets put the difference in a variable.
    const incomeWithDeduction = incomeInput - deduction();
    //calculate final annual declaration for both normal and with retiring plan
    const calcNormal = calc(incomeInput, regArr);
    const calcSavings = calc(incomeWithDeduction, savArr);
    //calculate possible savings
    const difInput = calcNormal - calcSavings;

    console.log(deduction());
    //display html for when NO retiring plan.
    if (!savingsInput) {
      result.innerHTML = `<p>Declaración Anual Sin Retiro: ${moneyFormat.format(
        calcNormal
      )}</p>`;
    }
    //display html for when calculating with retiring plan.
    else {
      result.innerHTML = `<p>Declaración Anual sin Retiro: <span class="has-text-weight-bold">${moneyFormat.format(
        calcNormal
      )}</span></p>
                            <p>Declaración con Retiro: <span class="has-text-weight-bold">${moneyFormat.format(
                              calcSavings
                            )}</span></p>
                            <p>Posible Saldo a Favor: <span class="has-text-weight-bold">${moneyFormat.format(
                              difInput
                            )}</span></p>`;
    }
  });

  if (calc2) {
    clear.addEventListener("click", function () {
      calc2.elements.income.value = "";
      calc2.elements.savings.value = "";
      result.innerHTML = "";
      clear.classList.add("displayNone");
    });
  }
})();

// calc3 calcladora de prima vacacional
(function () {
  const calc3 = document.querySelector("#calc3");
  const result = document.querySelector("#result3");

  function days(year) {
    if (year === 1) {
      return 6;
    } else if (year === 2) {
      return 8;
    } else if (year === 3) {
      return 10;
    } else if (year === 4) {
      return 12;
    } else if (year >= 5 && year <= 9) {
      return 14;
    } else if (year >= 10 && year <= 14) {
      return 16;
    } else if (year >= 15 && year <= 19) {
      return 18;
    } else if (year >= 20 && year <= 24) {
      return 20;
    } else if (year >= 25 && year <= 29) {
      return 22;
    } else if (year >= 30 && year <= 34) {
      return 24;
    } else if (year >= 35 && year <= 39) {
      return 26;
    }
  }

  const porPrima = 0.25;

  function prima(sueldo) {
    return ((sueldo * 12) / 360) * porPrima;
  }

  function calc() {
    incomeInput = calc3.elements.income.value;
    yearsInput = calc3.elements.employed.value;

    if (!parseInt(incomeInput) || incomeInput < 0) {
      throw new Error(
        (result.innerHTML = `<p class="has-text-danger">Error: Sólo se permiten números.</p>`)
      );
    } else if (!parseInt(yearsInput) || yearsInput < 0) {
      throw new Error(
        (result.innerHTML = `<p class="has-text-danger">Error: Sólo se permiten números.</p>`)
      );
    } else if (yearsInput >= 30) {
      //result.innerHTML = `can't be more than 30`;
      throw new Error(
        (result.innerHTML = `<p class="has-text-danger">Error: Max años de trabajo: 39.</p>`)
      );
    } else {
      const userPrima = prima(parseInt(incomeInput));
      const vacaDays = days(parseInt(yearsInput));
      return userPrima * vacaDays;
    }
  }
  if (calc3) {
    calc3.addEventListener("submit", function (e) {
      e.preventDefault();
      result.innerHTML = `<p>Tu Priva Vacacional debe ser:<span class="has-text-weight-bold"> ${moneyFormat.format(
        calc()
      )}</span></p>`;
    });
  }
})();z
