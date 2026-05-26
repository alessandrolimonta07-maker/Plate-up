/* Mount the design canvas with all 8 IG posts as artboards */

const PostFrame = ({ children }) => (
  <div style={{
    width: '1080px',
    height: '1080px',
    background: 'transparent',
    position: 'relative',
  }}>
    {children}
  </div>
);

const App = () => (
  <DesignCanvas>
    <DCSection id="feed" title="Feed Instagram · @plate____up">
      <DCArtboard id="p1" label="01 · Brand" width={1080} height={1080}>
        <PostFrame><Post01/></PostFrame>
      </DCArtboard>
      <DCArtboard id="p2" label="02 · Impiatta il futuro" width={1080} height={1080}>
        <PostFrame><Post02/></PostFrame>
      </DCArtboard>
      <DCArtboard id="p3" label="03 · Menù multilingua" width={1080} height={1080}>
        <PostFrame><Post03/></PostFrame>
      </DCArtboard>
      <DCArtboard id="p4" label="04 · Ordini live" width={1080} height={1080}>
        <PostFrame><Post04/></PostFrame>
      </DCArtboard>
      <DCArtboard id="p5" label="05 · +25% rotazione" width={1080} height={1080}>
        <PostFrame><Post05/></PostFrame>
      </DCArtboard>
      <DCArtboard id="p6" label="06 · Carta vs digitale" width={1080} height={1080}>
        <PostFrame><Post06/></PostFrame>
      </DCArtboard>
      <DCArtboard id="p7" label="07 · Quote chef" width={1080} height={1080}>
        <PostFrame><Post07/></PostFrame>
      </DCArtboard>
      <DCArtboard id="p8" label="08 · CTA WhatsApp" width={1080} height={1080}>
        <PostFrame><Post08/></PostFrame>
      </DCArtboard>
      <DCArtboard id="p9" label="09 · Turni dipendenti" width={1080} height={1080}>
        <PostFrame><Post09/></PostFrame>
      </DCArtboard>
      <DCArtboard id="p10" label="10 · Prenotazioni" width={1080} height={1080}>
        <PostFrame><Post10/></PostFrame>
      </DCArtboard>
      <DCArtboard id="p11" label="11 · Statistiche piatti" width={1080} height={1080}>
        <PostFrame><Post11/></PostFrame>
      </DCArtboard>
      <DCArtboard id="p12" label="12 · Esaurito" width={1080} height={1080}>
        <PostFrame><Post12/></PostFrame>
      </DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
