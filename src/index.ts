import config from '../config.json';
import express, { Request } from 'express';
import crypto from 'crypto';

const app = express();

app.use(express.json());

interface User {
  id: number,
  role: number
  username: string,
  password: string,
}

interface AuthRequest extends Request {
  user?: User
};

const testUser: User = {id: 1, role: 1, username: "Bobert", password: "123"};

function createToken(id: number, role: number) {
  return hash(`${config.SECRET}${id}${role}`);
}

function hash(data: string) {
    return crypto.createHash('sha512').update(data).digest('hex');
}


// Log in
app.post("/login", (req, res) => {
  const {username, password} = req.body;
  // verify user with data from database
  if (username === testUser.username && password === testUser.password) {
    res.send({
      token: createToken(testUser.id, testUser.role),
      user: testUser
    });
  }
})


// Logged in middleware
app.use("/protec", (req: AuthRequest, res, next) => {
  if (req.headers.authorization) {
    const [token, id, role] = JSON.parse(req.headers.authorization);
    console.log({token, user: {id, role}});
    console.log(createToken(id, role));
    if (token == createToken(id, role)) {
      req.user = testUser; // get user from database
      next();
      return;
    }
    res.status(400);
    res.send({
      error: true,
      message: "Invalid credentials"
    });
  }

})

app.get("/protec/hi", (req: AuthRequest, res) => {
  res.send(`hi ${req.user?.username}`);
});

const port = Number(process.env.PORT || config.PORT);
app.listen(port, () => {
  console.info(`Started on ${port}`);
});

