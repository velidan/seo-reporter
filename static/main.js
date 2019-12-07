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

function explorePagesSeo(payload) {
  const body = JSON.stringify(
    { urls : payload }
  )
  console.log(body)
  return fetch('/explore-pages-seo', {
    method: 'POST',
    body: body
  })
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
        console.log('Explore Error :-S', err);
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
  return (
    <label className='form-row-wrapper'>
      <input className="form-field" 
          type='text' 
          value={value} 
          id={id} 
          placeholder='Enter URL to explore' 
          onChange={onChange} />
          { id > 0 &&  
          <button className='form-row-delete-btn action' onClick={() => { alert('delete row') }}>
            <svg class='svg-icon' width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M6 6v8.5c0 .47.124.874.297 1.144.177.275.361.356.489.356h6.428c.127 0 .312-.08.489-.356.173-.27.297-.673.297-1.144V6h1v8.5c0 .634-.164 1.23-.456 1.685-.288.448-.747.815-1.33.815H6.786c-.583 0-1.042-.367-1.33-.815C5.164 15.73 5 15.134 5 14.5V6h1z" clip-rule="evenodd"/>
              <path fill-rule="evenodd" d="M7.5 7.5A.5.5 0 018 8v6a.5.5 0 01-1 0V8a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V8a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V8a.5.5 0 01.5-.5zm3-3.5h-11v1h11V4zm-11-1a1 1 0 00-1 1v1a1 1 0 001 1h11a1 1 0 001-1V4a1 1 0 00-1-1h-11z" clip-rule="evenodd"/>
              <path d="M8 3a1 1 0 011-1h2a1 1 0 011 1v1H8V3z"/>
            </svg>
          </button>
          }
    </label>
  )
}

let fieldsCounter = 0;

function FormBulder(props) {
  const [ fields, setFieldsList ] = React.useState({ [ fieldsCounter ] : '' });

  function handleSubmit(e) {
    e.preventDefault()
    console.log('submit', fields);
    explorePagesSeo(fields)
      .then((res) => {
        console.log('res =>> ', res)
        props.onFetchedData(res)
      })
  }

  const generateOnChange = fieldId => (e) => {
    setFieldsList({ ...fields, [fieldId]: e.target.value });
  }

    console.log('fields', fields)
  const isDisabledSubmitBtn = Object.values(fields).every(o => !o);

  return (
    <section className='form-wrapper'>
      <header className='form-wrapper-header'>
        <h5>Please, insert the URL of the page that you want to check</h5>
        <button className='form-add-field-btn action' onClick={() => {
          setFieldsList({ ...fields, [ ++fieldsCounter ]: '' })
        }}>
          <svg className='svg-icon' width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 5.5a.5.5 0 01.5.5v4a.5.5 0 01-.5.5H6a.5.5 0 010-1h3.5V6a.5.5 0 01.5-.5z" clip-rule="evenodd"/>
            <path fill-rule="evenodd" d="M9.5 10a.5.5 0 01.5-.5h4a.5.5 0 010 1h-3.5V14a.5.5 0 01-1 0v-4z" clip-rule="evenodd"/>
          </svg>
        </button>
      </header>

      <form className='form' type='multipart/form-data' method='post' onSubmit={handleSubmit}>
        { Object.keys(fields).map(fieldId => <Field id={fieldId}
                                                    value={fields[ fieldId ]}
                                                    onChange={generateOnChange(fieldId)} />) }

      <button className='form-submit-btn action' disabled={isDisabledSubmitBtn} type='submit'>Explore</button>
      </form>

    </section>
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
          <header className='header'>
            <h1 className='title-primary'>SEO Reporter</h1>
            <p>Fill the form above and explore the title SEO structure of any real website. Try, it's easy.</p>
          </header>
            
            <FormBulder onFetchedData={data => setParsedData(data)} />
            {/* <Btn onClick={getParsedData} /> */}
            { getContent() }
        </main>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));
