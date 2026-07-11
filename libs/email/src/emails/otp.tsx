import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'react-email';

export default function OtpEmail() {
  return (
    <Html>
      <Head />
      <Preview>{'{{title}}'}</Preview>
      <Body style={main}>
        <Container style={page}>
          <Section style={brandWrap}>
            <Text style={brand}>
              <span style={brandSweet}>Sweet</span>
              <span style={brandMe}>Me</span>
            </Text>
          </Section>
          <Section style={card}>
            <Heading style={heading}>{'{{title}}'}</Heading>
            <Text style={intro}>{'{{intro}}'}</Text>
            <Text style={label}>Your verification code:</Text>
            <Section style={codeBox}>
              <Text style={code}>{'{{code}}'}</Text>
            </Section>
            <Text style={expires}>{'{{expiresIn}}'}</Text>
            <Text style={security}>{'{{securityNote}}'}</Text>
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
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
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
  padding: '44px 36px',
  textAlign: 'center' as const,
};

const heading = {
  color: '#f8f5fd',
  fontSize: '24px',
  fontWeight: '700',
  letterSpacing: '0',
  lineHeight: '30px',
  margin: '0 0 20px',
};

const intro = {
  color: '#acaab1',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 auto 36px',
  maxWidth: '440px',
};

const label = {
  color: '#acaab1',
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '20px',
  margin: '0 0 12px',
};

const codeBox = {
  backgroundColor: '#08080b',
  border: '1px solid rgba(248, 245, 253, 0.04)',
  borderRadius: '16px',
  margin: '0 auto 26px',
  maxWidth: '310px',
  padding: '18px 20px',
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

const expires = {
  color: '#acaab1',
  fontSize: '14px',
  fontWeight: '700',
  lineHeight: '20px',
  margin: '0 0 4px',
};

const security = {
  color: '#acaab1',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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
