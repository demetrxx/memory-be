import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'react-email';

export default function MarketingWithCode() {
  return (
    <Html>
      <Head />
      <Preview>{'{{subject}}'}</Preview>
      <Body style={main}>
        <Container style={page}>
          <Section style={brandWrap}>
            <Text style={brand}>
              <span style={brandSweet}>Sweet</span>
              <span style={brandMe}>Me</span>
            </Text>
          </Section>
          <Section style={card}>
            <Img src="{{imgUrl}}" alt="" width="560" style={image} />
            <Heading style={heading}>{'{{subject}}'}</Heading>
            <Text style={text}>{'{{text}}'}</Text>
            <Section style={codeBox}>
              <Text style={codeLabel}>Your code</Text>
              <Text style={code}>{'{{code}}'}</Text>
            </Section>
            <Button href="{{url}}" style={button}>
              {'{{cta}}'}
            </Button>
          </Section>
          <Text style={footer}>
            <Link href="mailto:{{recipientEmail}}" style={footerLink}>
              {'{{recipientEmail}}'}
            </Link>
            {' was used at SweetMe.'}
            <br />
            Didn&apos;t request this? You can safely ignore this email.
            <br />
            <br />
            You are receiving this email from SweetMe.
            <br />
            SweetMe
            <br />
            418 Rose Circuit, Suite 1200, Dover, DE 19901
            <br />
            <span style={footerCode}>code: {'{{code}}'}</span>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#0e0e13',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: '0',
};

const page = {
  margin: '0 auto',
  maxWidth: '720px',
  padding: '40px 20px',
};

const brandWrap = {
  margin: '0 0 28px',
  textAlign: 'center' as const,
};

const brand = {
  fontSize: '34px',
  fontWeight: '700',
  letterSpacing: '0',
  lineHeight: '38px',
  margin: '0',
};

const brandSweet = {
  color: '#ff69a6',
};

const brandMe = {
  color: '#f8f5fd',
};

const card = {
  backgroundColor: '#1f1f26',
  border: '1px solid rgba(248, 245, 253, 0.08)',
  borderRadius: '24px',
  boxShadow: '0 28px 80px rgba(0, 0, 0, 0.3)',
  margin: '0 auto',
  maxWidth: '540px',
  padding: '32px',
  textAlign: 'center' as const,
};

const image = {
  borderRadius: '16px',
  display: 'block',
  margin: '0 0 28px',
  maxWidth: '100%',
};

const heading = {
  color: '#f8f5fd',
  fontSize: '24px',
  fontWeight: '700',
  letterSpacing: '0',
  lineHeight: '30px',
  margin: '0 0 20px',
};

const text = {
  color: '#acaab1',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 auto 28px',
  maxWidth: '440px',
};

const codeBox = {
  backgroundColor: '#08080b',
  border: '1px solid rgba(248, 245, 253, 0.04)',
  borderRadius: '16px',
  margin: '0 auto 26px',
  maxWidth: '310px',
  padding: '18px 20px',
  textAlign: 'center' as const,
};

const codeLabel = {
  color: '#acaab1',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '0',
  lineHeight: '20px',
  margin: '0 0 12px',
};

const code = {
  color: '#ffffff',
  fontFamily: "'Courier New', Monaco, Consolas, monospace",
  fontSize: '36px',
  fontVariantNumeric: 'tabular-nums',
  fontWeight: '700',
  letterSpacing: '10px',
  lineHeight: '42px',
  margin: '0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#ff89ab',
  borderRadius: '999px',
  color: '#5c0027',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '800',
  padding: '12px 22px',
  textDecoration: 'none',
};

const footer = {
  color: '#76747b',
  fontSize: '14px',
  lineHeight: '21px',
  margin: '34px auto 0',
  maxWidth: '520px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#2f80ff',
  textDecoration: 'underline',
};

const footerCode = {
  color: '#15151a',
};
