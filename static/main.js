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

function Btn(props) {

    return (<button onClick={props.onClick}>get data</button>)
}

function App() {
    const [ parsedData, setParsedData ] = React.useState({});

    function getParsedData() {
        getDataApi()
            .then(data => setParsedData(data))
            .catch(() => alert("Panic. Please, restart the app or contact the author."))
    }

    console.log("parsedData => ", parsedData)

    function getContent() {
        if (!parsedData) return null;

        return Object.keys(parsedData)
                .map(url => {
                    return (
                        <div>
                            <b className='source-title'>{url}</b>
                            <br />
                            <br />
                            { parsedData[url].map(tag => <div className='tag-box'><code>{tag}</code><div className='tag-value' dangerouslySetInnerHTML={{__html: tag}}/></div>) }
                        </div>
                    )
                })
    }

    return (
        <main>
            <h1>Hello React </h1>
            <Btn onClick={getParsedData} />
            { getContent() }
        </main>
    )
}
console.log("document.getElementById('root')", document.getElementById('root'));
console.log("ReactDom", ReactDOM)
console.log("App", App)
ReactDOM.render(<App />, document.getElementById('root'));
