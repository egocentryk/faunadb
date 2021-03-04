import express, { Request, Response } from 'express';
import faunadb from 'faunadb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const client = new faunadb.Client({
  secret: <string>process.env.FAUNA_KEY
});

const {
  Call,
  Collection,
  Create,
  Get,
  Index,
  Join,
  Lambda,
  Match,
  Paginate,
  Ref,
  Select,
  Var,
  Function: Fn
} = faunadb.query;

app.get('/posts/:username', async (req: Request, res: Response) => {
  const document = await client.query(
    Paginate(
      Match(
        Index('posts_by_user'),
        Call(Fn('getUser'), req.params.username)
      )
    )
  ).catch(e => res.send(e));

  res.send(document);
});

app.get('/post/:id', async (req: Request, res: Response) => {
  const document = await client.query(
    Get(
      Ref(
        Collection('posts'), req.params.id
      )
    )
  ).catch(e => res.send(e));

  res.send(document);
});

app.post('/post', async (req: Request, res: Response) => {
  const data = {
    user: Call(Fn('getUser'), 'egocentryk'),
    text: 'This is an example post'
  }

  const document = await client.query(
    Create(
      Collection('posts'), { data }
    )
  ).catch(e => res.send(e));

  res.send(document);
});

app.post('/relationship', async (req: Request, res: Response) => {
  const data = {
    follower: Call(Fn('getUser'), 'jane'),
    followee: Call(Fn('getUser'), 'egocentryk')
  }

  const document = await client.query(
    Create(
      Collection('relationships'), { data }
    )
  );

  res.send(document);
});

app.get('/feed', async (req: Request, res: Response) => {
  const document = await client.query(
    Paginate(
      Join(
        Match(
          Index('followers_by_followee'),
          Call(Fn('getUser'), 'jane')
        ),
        Index('posts_by_user')
      )
    )
  );

  res.send(document);
});

app.listen(
  5000,
  () => console.log('API on https://localhost:5000')
)