var canvas = document.getElementById("rsaGameCanvas");
var ctx = canvas.getContext("2d");

//  ### GLOBAL PARAMETERS

BG_COLOR = "#ddd";
CLEAR_COLOR = BG_COLOR;

// same as in html, canva dimensions
WIDTH = 800;
HEIGHT = 400;

// position of texts
const PY = 100; // p
const QY = 120; // q
const NY = 140; // n = pq
const PHIY = 160; // phi(n) euler
const EY = 180; // e premier avec phi(n)
const EDBZEOUTY = 200; // d inverse de e modulo phi(n) (e * d = 1 [phi(n)])

// position of image blocks
YOUR_PRIVATE_KEY_POS = [80, 40];
YOUR_PUBLIC_KEY_POS = [220, 40];
BOB_PUBLIC_KEY_POS = [520, 40];

MESSAGE_POS = [35, 230];
MESSAGE_POS_B = [35, MESSAGE_POS[1] + 80];

CRYPTED_MESSAGE_POS = [350, MESSAGE_POS[1]];
CRYPTED_MESSAGE_POS_B = [350, CRYPTED_MESSAGE_POS[1] + 80];

// Bob RSA values :
BOB_P = 53197;
BOB_Q = 6782771;
BOB_E = 67;
BOB_D = 27940963;
BOB_MESSAGE_SENT = 123456;

function getBobMessageSent(n) {
  if (n < 2) {
    return 0;
  }
  let mess = BOB_MESSAGE_SENT.toString();
  let messInt = parseInt(mess);
  while (messInt >= n) {
    mess = mess.slice(0, -1);
    messInt = parseInt(mess);
  }
  return messInt;
}

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
// ### MATH FUNCTIONS

const isPrime = (num) => {
  if (!num) {
    return false;
  }
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return num > 1;
};

const nextPrime = (num = 2) => {
  while (!isPrime(++num)) {}
  return num;
};

var gcd = function (a, b) {
  if (!b) {
    return a;
  }
  return gcd(b, a % b);
};

function rdChoice(array) {
  const randomElement = array[Math.floor(Math.random() * array.length)];
  return randomElement;
}

function findSuitableE(phi) {
  const suitableChoices = [];
  for (let i = 3; i < 5000; i += 2) {
    if (gcd(i, phi) == 1) {
      suitableChoices.push(i);
    }
  }
  i = 5001;
  if (suitableChoices.length == 0) {
    if (gcd(i, phi) == 1) {
      return i;
    }
    i += 2;
  }
  return rdChoice(suitableChoices);
}

function checkedphi(e, d, phi) {
  return (e * d) % phi == 1;
}

function egcd(a, b) {
  // extended euclidean algorithm
  // old_s * a + old_t * b = gcd (Bezout) OR old_t * a + old_s * b = gcd
  // (order can change depending if a < b or not)
  if (a < b) [a, b] = [b, a];
  let s = 0,
    old_s = 1;
  let t = 1,
    old_t = 0;
  let r = b,
    old_r = a;
  while (r != 0) {
    let q = Math.floor(old_r / r);
    [r, old_r] = [old_r - q * r, r];
    [s, old_s] = [old_s - q * s, s];
    [t, old_t] = [old_t - q * t, t];
  }
  //console.log("Bezout coef: ", old_s, old_t);
  //console.log("GCD: ", old_r);
  //console.log("Quot by GCD: ", s, t);

  return [old_t, old_s, old_r];
}

function findD(e, phi) {
  // d is private key, inverse of e modulo phi
  // Extended Euclidean algorithm is used (not brute force)
  const rep = egcd(e, phi);
  const old_t = rep[0];
  const old_s = rep[1];
  const pgcd = rep[2];
  if (pgcd !== 1) {
    console.log("wtf e and phi");
  }
  let d;
  let other_coef;
  if (e > phi) {
    d = old_s;
    other_coef = old_t;
  } else {
    d = old_t;
    other_coef = old_s;
  }
  while (d < 0) {
    d += phi;
  }
  d = d % phi;
  // d * e + other_coef * phi = pgcd
  other_coef = parseInt(-(d * e) / phi);
  return [d, other_coef, pgcd];
}

function modExp(base, exponent, modulus) {
  if (modulus === 1) return 0; // Avoid division by zero

  let result = 1;
  base = base % modulus;

  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % modulus;
    }
    exponent = Math.floor(exponent / 2);
    base = (base * base) % modulus;
  }

  return result;
}

function encryptMessage(message, e, n) {
  //console.log("mess : ", message);
  //console.log("a : ", Math.pow(message, e));
  //console.log("b : ", n);
  //console.log("c : ", Math.pow(message, e) % n);
  return modExp(message, e, n);
}

function decryptMessage(message, d, n) {
  return modExp(message, d, n);
}

// ### BASIC DISPLAY FUNCTIONS
function drawArrow(x1, y1, x2, y2) {
  var arrowWidth = 5;
  var dx = x2 - x1;
  var dy = y2 - y1;
  var length = Math.sqrt(dx * dx + dy * dy);
  var angle = Math.atan2(dy, dx);
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - arrowWidth * Math.cos(angle - Math.PI / 6),
    y2 - arrowWidth * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(x2, y2);

  ctx.lineTo(
    x2 - arrowWidth * Math.cos(angle + Math.PI / 6),
    y2 - arrowWidth * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
  ctx.closePath();
}

function draw_line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}
function basic_text(text, x, y, color = "#000", size = 10) {
  ctx.font = `${size}px serif`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function draw_lines_board(x1 = 200, x2 = 600) {
  ctx.strokeStyle = CLEAR_COLOR;
  draw_line(x1, 0, x1, WIDTH);
  draw_line(x2, 0, x2, WIDTH);
  ctx.strokeStyle = "#000";
  draw_line(x1, 0, x1, WIDTH);
  draw_line(x2, 0, x2, WIDTH);
}
function split_board(x1 = 200, x2 = 600) {
  draw_lines_board(x1, x2);
  ctx.fillText("Domaine Publique", -35 + x1 + (x2 - x1) / 2, 10);
  ctx.fillText("Vos secrets", -30 + x1 / 2, 10);
  ctx.fillText("Secrets de Bob", -30 + WIDTH - (WIDTH - x2) / 2, 10);
  basic_text("?", -20 + WIDTH - (WIDTH - x2) / 2, HEIGHT / 2, "#000", 100);
}

function drawImage(
  imgPos = [50, 50],
  imgPath = "images/private_key.png",
  topText = "",
  bottomText = "",
  options = {}
) {
  const topDeltaX = options.topDeltaX ?? 0;
  const bottomDeltaX = options.bottomDeltaX ?? 0;
  const topDeltaY = options.topDeltaY ?? 0;
  const bottomDeltaY = options.bottomDeltaY ?? 40;
  const img = new Image();
  img.src = imgPath;
  img.onload = () => {
    const textPos = [imgPos[0] + topDeltaX, imgPos[1] + topDeltaY];
    const keyValuePos = [imgPos[0] + bottomDeltaX, imgPos[1] + bottomDeltaY];
    ctx.font = "10px serif";
    ctx.fillStyle = "#000";
    topText && basic_text(topText, textPos[0], textPos[1]);
    bottomText && basic_text(bottomText, keyValuePos[0], keyValuePos[1]);
    if (options.newWidth && options.newHeight) {
      ctx.drawImage(
        img,
        imgPos[0],
        imgPos[1],
        options.newWidth,
        options.newHeight
      );
    } else {
      ctx.drawImage(img, imgPos[0], imgPos[1]);
    }
  };
}

function clearText(x, y) {
  ctx.beginPath();
  ctx.rect(x, y - 10, 180, 17);
  ctx.fillStyle = CLEAR_COLOR;
  ctx.fill();
  ctx.closePath();
}
// ### DOM manipulation

function set_visibility(element, v = "visible") {
  if (v === "visible") {
    element.removeAttribute("hidden");
  } else {
    element.setAttribute("hidden", "hidden");
  }
}

// ### SPECIFIC DISPLAY FUNCTIONS
function clear_your_private_key() {
  ctx.beginPath();
  ctx.rect(YOUR_PRIVATE_KEY_POS[0], YOUR_PRIVATE_KEY_POS[1] - 10, 117, 52);
  ctx.fillStyle = CLEAR_COLOR;
  ctx.fill();
  ctx.closePath();
}
function add_your_private_key(d = "") {
  clear_your_private_key();
  drawImage(
    YOUR_PRIVATE_KEY_POS,
    "images/private_key.png",
    "Clé Privée",
    `d = ${d}`
  );
}

function clear_your_public_key() {
  ctx.beginPath();
  ctx.rect(YOUR_PUBLIC_KEY_POS[0], YOUR_PUBLIC_KEY_POS[1] - 10, 200, 52);
  ctx.fillStyle = CLEAR_COLOR;
  ctx.fill();
  ctx.closePath();
}
function add_your_public_key(n = " ", e = " ") {
  clear_your_public_key();
  drawImage(
    YOUR_PUBLIC_KEY_POS,
    "images/public_key.png",
    "Clé Publique",
    `(n,e) = (${n}, ${e})`
  );
}

function clear_bob_public_key() {
  ctx.beginPath();
  ctx.rect(BOB_PUBLIC_KEY_POS[0] - 150, BOB_PUBLIC_KEY_POS[1] - 10, 227, 52);
  ctx.fillStyle = CLEAR_COLOR;
  ctx.fill();
  ctx.closePath();
}
function add_bob_public_key(n = " ", e = " ") {
  clear_your_public_key();
  const options = { topDeltaX: 10, bottomDeltaX: -50 };
  drawImage(
    BOB_PUBLIC_KEY_POS,
    "images/public_key_flipped.png",
    "Clé Publique",
    `(${BOB_P * BOB_Q}, ${BOB_E}) = (n, e)`,
    options
  );
}
function clear_message_areas() {
  ctx.beginPath();
  ctx.rect(0, MESSAGE_POS[1] - 15, WIDTH, 1000);
  ctx.fillStyle = CLEAR_COLOR;
  ctx.fill();
  ctx.closePath();

  draw_lines_board();
}
function clear_message_area() {
  ctx.beginPath();
  ctx.rect(MESSAGE_POS[0] - 50, MESSAGE_POS[1] - 10, 200, 75);
  ctx.fillStyle = CLEAR_COLOR;
  ctx.fill();
  ctx.closePath();
}
function add_message_area(message = "test", for_bob = true) {
  options = {
    newWidth: 50,
    newHeight: 50,
    bottomDeltaY: 60,
    bottomDeltaX: -1.5 * message.toString().length + 20,
    topDeltaX: -12,
  };
  const pos = for_bob ? MESSAGE_POS : MESSAGE_POS_B;
  const topText = for_bob ? "Message pour Bob" : "Message de bob";
  drawImage(pos, "images/file.png", topText, message, options);
}
function clear_crypted_message_area() {
  ctx.beginPath();
  ctx.rect(CRYPTED_MESSAGE_POS[0] - 50, CRYPTED_MESSAGE_POS[1] - 10, 200, 75);
  ctx.fillStyle = CLEAR_COLOR;
  ctx.fill();
  ctx.closePath();
}
function add_crypted_message_area(message = "test_c", for_bob = true) {
  options = {
    newWidth: 50,
    newHeight: 50,
    bottomDeltaY: 60,
    bottomDeltaX: -1.5 * message.toString().length + 20,
    topDeltaX: -28,
  };
  const pos = for_bob ? CRYPTED_MESSAGE_POS : CRYPTED_MESSAGE_POS_B;

  const topText = for_bob
    ? "Message Chiffré pour Bob"
    : "Message Chiffré pour vous";
  drawImage(pos, "images/file_crypted.png", topText, message, options);
}

function add_message_arrows() {
  drawArrow(83, 257, 350, 257);
  drawArrow(400, 257, 597, 257);
  drawArrow(597, 338, 400, 338);
  drawArrow(350, 338, 83, 338);
}
// ### TEXT AREAS

function update_n(p, q, nx = 15, ny = NY, phix = 14, phiy = PHIY) {
  if (!p || !q) {
    return;
  }
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  clearText(nx, ny);
  basic_text(`n = pq = ${n}`, nx, ny);
  clearText(phix, phiy);
  basic_text(`Phi = (p-1)(q-1) = ${phi}`, phix, phiy);
  return true;
}

function update_e(p, q) {
  const e_div = document.getElementById("div_number_e");
  const number_e = document.getElementById("number_e");
  const e_error = document.getElementById("number_e_error");
  const e = number_e.value;

  let isValid = true;
  console.log("update e :", p, q);
  if (isPrime(p) && isPrime(q)) {
    set_visibility(e_div, "visible");
  } else {
    number_e.value = "";
    set_visibility(e_div, "hidden");
    clear_e_text_area();
    isValid = false;
  }

  if (!e) {
    return;
  }

  const phi = (p - 1) * (q - 1);
  const pgcd = gcd(e, phi);
  if (pgcd !== 1) {
    isValid = false;
    e_error.innerText = `e n'est pas premier avec Phi(n) =${phi} (pgcd ${pgcd})\nessayez : ${findSuitableE(
      phi
    )}`;
  } else {
    e_error.innerHTML = "&nbsp;";
  }
  return isValid;
}

function update_d(e, p, q) {
  const phi = (p - 1) * (q - 1);
  const fd = findD(e, phi);
  const d = fd[0];
  const other_coef = fd[1];
  //console.log("d trouvé ", d, "pour e = ", e, "phi =", phi);
  if ((e * d) % phi != 1) {
    console.log("Pas inverse : ", e, d, phi);
    return;
  }
  clearText(15, EDBZEOUTY);
  basic_text(`Bezout : d*e + ${other_coef} Phi = ${fd[2]}`, 15, EDBZEOUTY);
  add_your_private_key(d);
}

function update_messages(e, p, q) {
  const message_input_div = document.getElementById("div_message_input");

  if (!e || !p || !q) {
    try {
      set_visibility(message_input_div, "hidden");
    } catch (e) {}
    clear_message_areas();
    return;
  }
  set_visibility(message_input_div, "visible");
  const message_input = document.getElementById("message_input");
  let message_value = message_input.value;
  const phi = (p - 1) * (q - 1);
  const fd = findD(e, phi);
  const d = fd[0];
  const n = p * q;
  if (!message_value) {
    message_value = 0;
  }
  clear_message_areas();
  add_message_area(message_value);
  add_crypted_message_area(encryptMessage(message_value, BOB_E, BOB_P * BOB_Q));
  add_message_area(
    decryptMessage(encryptMessage(getBobMessageSent(n), e, n), d, n),
    false
  );
  console.log(
    "Message sent by Bob ",
    encryptMessage(getBobMessageSent(n), e, n)
  );
  add_crypted_message_area(encryptMessage(getBobMessageSent(n), e, n), false);
  add_message_arrows();
}

function update_all() {
  const prime_number_p = document.getElementById("prime_number_p");
  const prime_number_q = document.getElementById("prime_number_q");
  const p = prime_number_p.value;
  const q = prime_number_q.value;
  const number_e = document.getElementById("number_e");
  const e = number_e.value;
  update_d(e, p, q);
  const n_good = update_n(p, q);
  const e_good = update_e(p, q);
  if (e_good && n_good) {
    add_your_public_key(p * q, e);
    update_messages(e, p, q);
  } else {
    update_messages();
  }
}

// ### ON INPUT TEXT AREAS
function p_q_text_areas(px = 15, py = PY, qx = 15, qy = QY) {
  const prime_number_p = document.getElementById("prime_number_p");
  const prime_number_q = document.getElementById("prime_number_q");

  const p_error = document.getElementById("prime_number_p_error");
  const q_error = document.getElementById("prime_number_q_error");

  prime_number_p.oninput = function () {
    const p = prime_number_p.value;
    update_all();
    if (!p) {
      p_error.innerHTML = "&nbsp;";
      update_all();
      return;
    }
    if (!isPrime(p)) {
      p_error.innerText = "p n'est pas premier";
      return;
    }
    p_error.innerHTML = "&nbsp;";
    clearText(px, py);
    basic_text(`p = ${p}`, px, py);
    update_all();
  };

  prime_number_q.oninput = function () {
    const q = prime_number_q.value;
    update_all();

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
    update_all();
  };
}

function clear_e_text_area(ex = 15, ey = EY) {
  clearText(ex, ey);
}

function e_text_area(ex = 15, ey = EY) {
  const number_e = document.getElementById("number_e");
  const e_error = document.getElementById("number_e_error");

  const prime_number_p = document.getElementById("prime_number_p");
  const prime_number_q = document.getElementById("prime_number_q");

  number_e.oninput = function () {
    const e = number_e.value;
    const p = prime_number_p.value;
    const q = prime_number_q.value;
    if (!e) {
      e_error.innerHTML = "&nbsp;";
      clearText(ex, ey);
      return;
    }
    if (!update_e(p, q)) {
      return;
    }
    e_error.innerHTML = "&nbsp;";
    clearText(ex, ey);
    basic_text("e = " + number_e.value.toString(), ex, ey);
    update_all();
  };
}

function message_text_area(ex = 15, ey = EY) {
  const message_input = document.getElementById("message_input");
  const message_error = document.getElementById("message_error");

  const prime_number_p = document.getElementById("prime_number_p");
  const prime_number_q = document.getElementById("prime_number_q");

  message_input.oninput = function () {
    const p = prime_number_p.value;
    const q = prime_number_q.value;
    console.log("test : ", message_input.value);
    update_all();
  };
}

// CORE RUN (IF NAME MAIN)
split_board();
e_text_area();
add_your_private_key();
add_your_public_key();
p_q_text_areas();
message_text_area();
//clear_bob_public_key();
add_bob_public_key();
