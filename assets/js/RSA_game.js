var canvas = document.getElementById("rsaGameCanvas");
var ctx = canvas.getContext("2d");
WIDTH = 800;
HEIGHT = 400;
canvas.addEventListener(
  "click",
  function (event) {
    elemLeft = canvas.offsetLeft + canvas.clientLeft;
    elemTop = canvas.offsetTop + canvas.clientTop;
    context = canvas.getContext("2d");
    console.log();
    var x = event.pageX - elemLeft,
      y = event.pageY - elemTop;
    console.log(x, y);
  },
  false
);
// MATH FUNCTIONS

const isPrime = (num) => {
  if (!num) {
    return false;
  }
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return num > 1;
};

var gcd = function (a, b) {
  if (!b) {
    return a;
  }
  return gcd(b, a % b);
};

function checkedphi(e, d, phi) {
  return (e * d) % phi == 1;
}

// BASIC DISPLAY FUNCTIONS
function draw_line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}

function split_board(x1 = 200, x2 = 600) {
  draw_line(x1, 0, x1, WIDTH);
  draw_line(x2, 0, x2, WIDTH);
  ctx.fillText("Domaine Publique", -35 + x1 + (x2 - x1) / 2, 10);
}

function basic_text(text, x, y, color = "#000", size = 10) {
  ctx.font = `${size}px serif`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawImage(
  imgPos = [50, 50],
  imgPath = "images/private_key.png",
  topText = "TopText",
  bottomText = "BottomText"
) {
  const img = new Image();
  img.src = "images/private_key.png";
  img.onload = () => {
    const textPos = [imgPos[0] + 10, imgPos[1]];
    const keyValuePos = [textPos[0], textPos[1] + 40];
    ctx.font = "10px serif";
    ctx.fillStyle = "#000";
    topText && basic_text(topText, textPos[0], textPos[1]);
    bottomText && basic_text(bottomText, keyValuePos[0], keyValuePos[1]);
    ctx.drawImage(img, imgPos[0], imgPos[1]);
  };
}
function clearText(x, y) {
  ctx.beginPath();
  ctx.rect(x, y - 10, 180, 17);
  ctx.fillStyle = "#eee";
  ctx.fill();
  ctx.closePath();
}
// DOM manipulation

function set_visibility(element, v = "visible") {
  if (v === "visible") {
    element.removeAttribute("hidden");
  } else {
    element.setAttribute("hidden", "hidden");
  }
}

// SPECIFIC DISPLAY FUNCTIONS

function add_your_private_key(d = 12345) {
  drawImage(
    [120, 40],
    "images/private_key.png",
    "Clé Privée",
    "d = " + d.toString()
  );
}

// TEXT AREAS

PY = 100; // p
QY = 120; // q
NY = 140; // n = pq
PHIY = 160; // phi(n) euler
EY = 180; // e premier avec phi(n)
DY = 200; // d inverse de e modulo phi(n) (e * d = 1 [phi(n)])

function update_n(p, q, nx = 15, ny = 140) {
  const n = p * q;
  clearText(nx, ny);
  basic_text(`n = p x q = ${p * q}`, nx, ny);
}

function update_e(p, q) {
  const e_div = document.getElementById("div_number_e");
  const number_e = document.getElementById("number_e");

  if (isPrime(p) && isPrime(q)) {
    set_visibility(e_div, "visible");
  } else {
    number_e.value = "";
    set_visibility(e_div, "hidden");
  }
}

function update_on_p_q_change(p, q) {
  if (!p || !q) {
    return;
  }
  update_n(p, q);
  update_e(p, q);
}

function update_n(p, q, nx = 15, ny = NY, phix = 15, phiy = PHIY) {
  const n = p * q;
  clearText(nx, ny);
  basic_text(`n = p x q = ${p * q}`, nx, ny);
  clearText(phix, phiy);
  basic_text(`Phi(n) = (p - 1) x (q - 1) = ${(p - 1) * (q - 1)}`, phix, phiy);
}

// on input text areas
function p_q_text_areas(px = 15, py = PY, qx = 15, qy = QY) {
  const prime_number_p = document.getElementById("prime_number_p");
  const prime_number_q = document.getElementById("prime_number_q");
  const p_error = document.getElementById("prime_number_p_error");
  const q_error = document.getElementById("prime_number_q_error");

  prime_number_p.oninput = function () {
    p = prime_number_p.value;
    if (!p) {
      p_error.innerHTML = "&nbsp;";
      update_on_p_q_change(p, prime_number_q.value);
      return;
    }
    if (!isPrime(p)) {
      p_error.innerText = "p n'est pas premier";
      update_on_p_q_change(p, prime_number_q.value);
      return;
    }
    p_error.innerHTML = "&nbsp;";
    clearText(px, py);
    basic_text(`p = ${p}`, px, py);
    update_on_p_q_change(p, prime_number_q.value);
  };

  prime_number_q.oninput = function () {
    q = prime_number_q.value;
    if (!q) {
      q_error.innerHTML = "&nbsp;";
      return;
    }
    if (!isPrime(q)) {
      q_error.innerText = "q n'est pas premier";
      return;
    }
    q_error.innerHTML = "&nbsp;";
    clearText(qx, qy);
    basic_text(`q = ${q}`, qx, qy);
    update_on_p_q_change(prime_number_p.value, prime_number_q.value);
  };
}

function e_text_area(ex = 15, ey = EY) {
  const number_e = document.getElementById("number_e");
  number_e.oninput = function () {
    clearText(ex, ey);
    basic_text("e = " + number_e.value.toString(), ex, ey);
  };
}

split_board();
add_your_private_key();
p_q_text_areas();
