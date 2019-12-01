function getDataApi() {
    return fetch('/get-parsed-data')
      .then(
        function(response) {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }

          // Examine the text in the response
          return response.json();
        }
      )
      .catch(function(err) {
        console.log('Fetch Error :-S', err);
      });
}

function TagRow({ tag_name, raw_tag }) {

  const [ isSourceShow, setSourceShow ] = React.useState(false);
  return (
    <div className='tag-row-wrapper'>
      <div className='tag-row'>
          <b className='tag-name'>{ tag_name } :</b>
          <div className='tag-value' dangerouslySetInnerHTML={{__html: raw_tag}}/>
          <button className='tag-detail-btn' onClick={() => setSourceShow(!isSourceShow)}>Details</button>
          
      </div>
      <code className={`tag-source ${isSourceShow ? 'show' : ''}`}>{raw_tag}</code>
    </div>
  )
}

function Btn(props) {
    return (<button onClick={props.onClick}>get data</button>)
}

function Field({ id, onChange, value }) {
  return (<input className="form-field" type='text' value={value} id={id} onChange={onChange} />)
}

let fieldsCounter = 0;

function FormBulder() {
  const [ fields, setFieldsList ] = React.useState({ [ fieldsCounter ] : '' });

  function handleSubmit(e) {
    e.preventDefault()
    console.log('submit', fields);
  }

  const generateOnChange = fieldId => (e) => {
    setFieldsList({ ...fields, [fieldId]: e.target.value });
  }

  return (
    <div>
      <form className='form' type='multipart/form-data' method='post' onSubmit={handleSubmit}>
        { Object.keys(fields).map(fieldId => <Field id={fieldId}
                                                    value={fields[ fieldId ]}
                                                    onChange={generateOnChange(fieldId)} />) }
      <button type='submit'>Check pages</button>
      </form>
      <button onClick={() => {
        setFieldsList({ ...fields, [ ++fieldsCounter ]: '' })
      }}>Add field</button>
    </div>
  );
}

function App() {
    const [ parsedData, setParsedData ] = React.useState({});

    function getParsedData() {
        getDataApi()
            .then(data => setParsedData(data))
            .catch(() => alert("Panic. Please, restart the app or contact the author."))
    }

    function getContent() {
        if (!parsedData) return null;

        return Object.keys(parsedData)
                .map(url => {
                    return (
                        <div>
                            <b className='source-title'>{url}</b>
                            <br />
                            <br />
                            { parsedData[url].map(tagData => <TagRow {...tagData} />) }
                        </div>
                    )
                })
    }

    return (
        <main>
            <h1>SEO Reporter</h1>
            <h3>Please, insert the URL of the page that you want to check</h3>
            <FormBulder />
            <Btn onClick={getParsedData} />
            { getContent() }
        </main>
    )
}
console.log("document.getElementById('root')", document.getElementById('root'));
console.log("ReactDom", ReactDOM)
console.log("App", App)
ReactDOM.render(<App />, document.getElementById('root'));
