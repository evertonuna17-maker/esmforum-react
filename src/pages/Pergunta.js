import React from 'react';
import { Link } from "react-router-dom";
import { Container, Table, Form, Button } from 'react-bootstrap';

// id_usuario fixo em 1: o sistema ainda não tem autenticação (mesma
// convenção já usada em cadastrar_pergunta no backend).
const ID_USUARIO_ATUAL = 1;

function postPergunta(pergunta, update) {
  const request = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pergunta: pergunta })
  };
  fetch('http://localhost:5000/perguntas', request)
    .then(response => response.json())
    .then(data => update(data.id_pergunta, pergunta));
}

function postVoto(id_pergunta, tipo, update) {
  const request = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario: ID_USUARIO_ATUAL, tipo: tipo })
  };
  fetch(`http://localhost:5000/perguntas/${id_pergunta}/votos`, request)
    .then(response => response.json())
    .then(data => update(id_pergunta, data.saldo));
}

function NovaPergunta(props) {
  const [texto, setTexto] = React.useState('');
  
  function handleChange (event) {
    setTexto(event.target.value);
  }

  function handleClick(event) {
    postPergunta(texto, props.update);
    setTexto('');
  }

  return (
    <Container>
      <Form>
        <Form.Group>
          <Form.Label> Faça a sua pergunta: </Form.Label>
          <Form.Control id="textarea-pergunta" as="textarea" value={texto} onChange={handleChange}/>
        </Form.Group>
        <Button id="btn-pergunta" onClick={handleClick}>Enviar</Button>
      </Form>
    </Container>
  );
}

function Pergunta() {
  const [listaPerguntas, setListaPerguntas] = React.useState([]);

  function adicionarNovaPergunta(id_pergunta, pergunta) {
    setListaPerguntas((prev) => {
      const novaPergunta = {
        id_pergunta: id_pergunta,
        texto: pergunta,
        num_respostas: 0,
        saldo_votos: 0,
      };
      return [...prev, novaPergunta];
    });
  }

  function atualizarSaldoVotos(id_pergunta, saldo) {
    setListaPerguntas((prev) =>
      prev.map((p) => (p.id_pergunta === id_pergunta ? { ...p, saldo_votos: saldo } : p))
    );
  }

  function TabelaPerguntas() {   

    function LinhaTabela({ pergunta }) {
      return (
        <tr>
          <td className="text-center"> {pergunta.id_pergunta} </td>
          <td> {pergunta.texto} </td>
          <td className="text-center"> 
              <Link to = {`/resposta/${pergunta.id_pergunta}`}> 
                 {pergunta.num_respostas}
              </Link>
          </td>
          <td className="text-center">
            <Button
              id={`btn-upvote-${pergunta.id_pergunta}`}
              size="sm"
              variant="outline-success"
              onClick={() => postVoto(pergunta.id_pergunta, 'upvote', atualizarSaldoVotos)}
            >
              ▲
            </Button>
            {' '}
            <span id={`saldo-votos-${pergunta.id_pergunta}`}>{pergunta.saldo_votos ?? 0}</span>
            {' '}
            <Button
              id={`btn-downvote-${pergunta.id_pergunta}`}
              size="sm"
              variant="outline-danger"
              onClick={() => postVoto(pergunta.id_pergunta, 'downvote', atualizarSaldoVotos)}
            >
              ▼
            </Button>
          </td>
        </tr>
      );
    }

    function TabelaPrincipal() {
      const linhas = listaPerguntas.map(p => ( <LinhaTabela pergunta={p} key={p.id_pergunta} /> ));  
      return (
        <div className="container">
          <center><h5>Peguntas Atuais</h5></center>
          <Table id="tabela-perguntas" striped bordered>
            <thead>
              <tr>
                <th className="text-center">ID</th>
                <th className="text-center">Pergunta</th>
                <th className="text-center"># Respostas</th>
                <th className="text-center">Votos</th>
              </tr>
            </thead>
            <tbody>
              {linhas}
            </tbody>
          </Table>
        </div>
      );
    }

    return (
      <div>
        <TabelaPrincipal />
        <NovaPergunta update={adicionarNovaPergunta}/>
      </div> 
    );
  }
    
  React.useEffect(() => {
    fetch("http://localhost:5000")
    .then((res) => res.json())
    .then((data) => setListaPerguntas(data));
  }, []);
    
  return (
    <div className="container"> 
      <TabelaPerguntas />
    </div>
  );
}

export default Pergunta;