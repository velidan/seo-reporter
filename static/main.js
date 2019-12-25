// a field ID autoincremental
let fieldsCounter = 0;

// a main request script
function explorePagesSeo(payload) {
  const body = JSON.stringify(
    { urls : payload }
  )
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

function Loader() {
  return (<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>);
}

function TagRow({ tag_name, raw_tag }) {

  const [ isSourceShow, setSourceShow ] = React.useState(false);
  return (
    <div className='tag-row-wrapper'>
      <div className='tag-row'>
          <b className='tag-name'>{ tag_name } :</b>
          <div className='tag-value' dangerouslySetInnerHTML={{__html: raw_tag}}/>
          <button className='standard-btn action' onClick={() => setSourceShow(!isSourceShow)}>Details</button>
          
      </div>
      <code className={`tag-source ${isSourceShow ? 'show' : ''}`}>{raw_tag}</code>
    </div>
  )
}

function Btn(props) {
    return (<button onClick={props.onClick}>get data</button>)
}

function FormBulder(props) {
  const [ val, setVal ] = React.useState("")
  const [ pending, setPending ] = React.useState(false);

  function handleSubmit(e) {
    e.preventDefault()
    setPending(true);
    explorePagesSeo(val)
      .then((res) => {
        props.onFetchedData(res)
        setPending(false);
      })
  }

  const handleOnDelete = fieldId => {
    let res = { ...fields};
    delete res[ fieldId ];
    setFieldsList(res);
  }

  const exploreBtnContent = pending
   ? <Loader />
   : 'Explore';

  return (
    <section className='form-wrapper'>
      <header className='form-wrapper-header'>
        <h5>Please, insert the URL of the page that you want to check</h5>
      </header>

      <form className='form' type='multipart/form-data' method='post' onSubmit={handleSubmit}>
        
          <label className='form-row-wrapper'>
            <textarea
              className="targets-textarea"
              rows="6" cols="45" name="targets"
              value={val}
              onChange={e => { setVal(e.target.value) }} />
            </label>

          <button className='form-submit-btn action' disabled={!val} type='submit'>
            { exploreBtnContent }
          </button>
      </form>

    </section>
  );
}

function Content({ url, data }) {

  const [ show, setShow ] = React.useState(false);

  return (
      <div className={`content-wrapper ${show ? 'show' : ''}`}>
          <b className='source-title'>
            {url}
            <span className='standard-btn action' onClick={ () => setShow(!show) }>Toggle Report</span>
          </b>
          { data[url].map(tagData => <TagRow {...tagData} />) }
      </div>
  );
}

function App() {
    const [ parsedData, setParsedData ] = React.useState({});

    function getContent() {
        if (!parsedData) return null;

        return Object.keys(parsedData)
                .map(url => {
                    return ( <Content url={url} data={parsedData} />)
                })
    }

    return (
        <main>
          <header className='header'>
            <h1 className='title-primary'>SEO Reporter</h1>
            <p>Fill the form above and explore the title SEO structure of any real website. Try, it's easy.</p>
          </header>
            
            <FormBulder onFetchedData={data => setParsedData(data)} />
            <div className='box'>{ getContent() }</div>
        </main>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));
